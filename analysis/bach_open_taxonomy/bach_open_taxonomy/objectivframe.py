"""
Copyright 2021 Objectiv B.V.
"""
from bach.expression import Expression, quote_identifier
from bach.sql_model import SampleSqlModel, BachSqlModel
from bach import DataFrame
from bach.types import get_dtype_from_db_dtype
from bach_open_taxonomy.stack.util import sessionized_data_model
from sql_models.graph_operations import find_node
from bach.dataframe import escape_parameter_characters
from bach_open_taxonomy.modelhub.modelhub import ModelHub
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from bach_open_taxonomy.series import SeriesLocationStack

TIME_DEFAULT_FORMAT = 'YYYY-MM-DD HH24:MI:SS.MS'


class ObjectivFrame(DataFrame):
    """
    The Objectiv Frame is an extension to Bach DataFrame to use specifically for data that was collected with
    Objectiv’s Tracker.

    It loads the data as stored by the Objectiv Tracker, makes a few transformations, and sets the right data
    types.

    This object points to the data on which the models from the open model hub can be applied. An
    ObjectivFrame is instantiated with :py:meth:`from_objectiv_data`.
    """

    def __init__(self, **kwargs):
        try:
            self._time_aggregation = kwargs.pop('time_aggregation')
        except KeyError:
            pass
        try:
            self._start_date = kwargs.pop('start_date')
        except KeyError:
            pass
        try:
            self._end_date = kwargs.pop('end_date')
        except KeyError:
            pass
        try:
            self._conversion_events = kwargs.pop('conversion_events')
        except KeyError:
            pass
        super().__init__(**kwargs)

    @property
    def time_aggregation(self):
        """
        Time aggregation used for aggregation models as set with :py:meth:`from_objectiv_data`
        """
        return self._time_aggregation

    @property
    def start_date(self):
        """
        Start date as set with :py:meth:`from_objectiv_data`
        """
        return self._start_date

    @property
    def end_date(self):
        """
        End date as set with :py:meth:`from_objectiv_data`
        """
        return self._end_date

    @property
    def conversion_events(self):
        """
        Dictionary of all events that are labeled as conversion.

        Set with :py:meth:`add_conversion_event`
        """
        return self._conversion_events

    @property
    def model_hub(self):
        """
        Access the :py:class:`ModelHub` from the ObjectivFrame. Same as :py:meth:`mh`.
        """
        return ModelHub(self)

    @property
    def mh(self):
        """
        Access the :py:class:`ModelHub` from the ObjectivFrame. Same as :py:meth:`model_hub`.
        """
        return ModelHub(self)

    @classmethod
    def from_objectiv_data(cls,
                           db_url: str = None,
                           start_date=None,
                           end_date=None,
                           time_aggregation: str = TIME_DEFAULT_FORMAT,
                           table_name: str = 'data') -> 'ObjectivFrame':
        """
        Loads data from table into an ObjectivFrame object.

        :param db_url: the url that indicate database dialect and connection arguments. If not given, env DSN
            is used to create one. If that's not there, the default of
            'postgresql://objectiv:@localhost:5432/objectiv' will be used.
        :param start_date: first date for which data is loaded to the DataFrame. If None, data is loaded from
            the first date in the sql table.
        :param end_date: last date for which data is loaded to the DataFrame. If None, data is loaded up to
            and including the last date in the sql table.
        :param time_aggregation: sets the default time_aggregation that can be used with the `time_aggregated`
            property as a normal series. This means for example that the `time_aggregated` can be used as
            to group by. Ie. YYYY-MM-DD groups the `time_aggregated` property to days (dates). The default
            sets it to the date time on miliseconds.
        :param table_name: the name of the sql table where the data is stored.
        """
        import sqlalchemy
        if db_url is None:
            import os
            db_url = os.environ.get('DSN', 'postgresql://objectiv:@localhost:5432/objectiv')
        engine = sqlalchemy.create_engine(db_url, pool_size=1, max_overflow=0)

        sql = f"""
            select column_name, data_type
            from information_schema.columns
            where table_name = '{table_name}'
            order by ordinal_position
        """
        with engine.connect() as conn:
            res = conn.execute(sql)
        dtypes = {x[0]: get_dtype_from_db_dtype(x[1]) for x in res.fetchall()}

        if dtypes != {'event_id': 'uuid', 'day': 'date', 'moment': 'timestamp', 'cookie_id': 'uuid',
                      'value': 'json'}:
            raise KeyError(f'Expected columns not in table {table_name}. Found: {dtypes}')

        model = sessionized_data_model(start_date=start_date, end_date=end_date, table_name=table_name)
        # The model returned by `sessionized_data_model()` has different columns than the underlying table.
        # Note that the order of index_dtype and dtypes matters, as we use it below to get the model_columns
        index_dtype = {'event_id': 'uuid'}
        dtypes = {
            'day': 'date',
            'moment': 'timestamp',
            'user_id': 'uuid',
            'global_contexts': 'jsonb',
            'location_stack': 'jsonb',
            'event_type': 'string',
            'stack_event_types': 'jsonb',
            'session_id': 'int64',
            'session_hit_number': 'int64'
        }
        model_columns = tuple(index_dtype.keys()) + tuple(dtypes.keys())
        bach_model = BachSqlModel.from_sql_model(
            sql_model=model,
            column_expressions={c: Expression.column_reference(c) for c in model_columns},
        )

        from bach.savepoints import Savepoints
        df = cls.get_instance(engine=engine,
                              base_node=bach_model,
                              index_dtypes=index_dtype,
                              dtypes=dtypes,
                              group_by=None,
                              order_by=[],
                              savepoints=Savepoints(),
                              variables={}
                              )

        df._time_aggregation = time_aggregation  # type: ignore
        df._start_date = start_date  # type: ignore
        df._end_date = end_date  # type: ignore
        df._conversion_events = {}  # type: ignore

        df['global_contexts'] = df.global_contexts.astype('objectiv_global_context')
        df['location_stack'] = df.location_stack.astype('objectiv_location_stack')

        return df  # type: ignore

    def add_conversion_event(self,
                             location_stack: 'SeriesLocationStack' = None,
                             event_type: str = None,
                             name: str = None):
        """
        Label events that are used as conversions. All labeled conversion events are set in
        :py:attr:`conversion_events`.

        :param location_stack: the location stack that is labeled as conversion. Can be any slice in of a
            objectiv_location_stack type column. Optionally use in conjunction with event_type to label a
            conversion.
        :param event_type: the event type that is labeled as conversion. Optionally use in conjunction with
            objectiv_location_stack to label a conversion.
        :param name: the name to use for the labeled conversion event. If None it will use 'conversion_#',
            where # is the number of the added conversion.
        """
        if location_stack is None and event_type is None:
            raise ValueError('At least one of conversion_stack or conversion_event should be set.')

        if not name:
            name = f'conversion_{len(self._conversion_events) + 1}'

        self._conversion_events[name] = location_stack, event_type

    @staticmethod
    def from_table(*args, **kwargs):
        """
        INTERNAL

        Overrides from_table from Objectiv Bach, so that it can't be used. An ObjectivFrame should be
        instantiated with from_objectiv_data.
        """
        raise NotImplementedError('Use ObjectivFrame.from_objectiv_data() to instantiate')

    @staticmethod
    def from_model(*args, **kwargs):
        """
        INTERNAL

        Overrides from_model from Objectiv Bach, so that it can't be used. An ObjectivFrame should be
        instantiated with from_objectiv_data.
        """
        raise NotImplementedError('Use ObjectivFrame.from_objectiv_data() to instantiate')

    @staticmethod
    def from_pandas(*args, **kwargs):
        """
        INTERNAL

        Overrides from_pandas from Objectiv Bach, so that it can't be used. An ObjectivFrame should be
        instantiated with from_objectiv_data.
        """
        raise NotImplementedError('Use ObjectivFrame.from_objectiv_data() to instantiate')

    def _hash_features(self, location_stack_column='location_stack'):
        """
        generates a hash for the columns `location_stack_column` and `event_type`.

        :param location_stack_column: name of the location stack column to include in the hash. Uses
            'location_stack' if None.
        :returns: series with hashes.
        """
        expression_str = "md5(concat({} #>> {}, {}))"
        expression = Expression.construct(
            expression_str,
            self[location_stack_column].ls.feature_stack,
            Expression.string_value('{}'),
            self.event_type
        )
        return self[location_stack_column].copy_override_dtype('string').copy_override(expression=expression)

    def _prepare_sample(self, location_stack_column='location_stack'):
        """
        prepares a sample of all unique combinations of values in location_stack_column and event_type. Also
        adds a count for the number of hits per unique combination of those.
        """
        df = self[[location_stack_column, 'event_type']]
        df[location_stack_column] = df[location_stack_column].ls.feature_stack
        feature_hash = df._hash_features(location_stack_column=location_stack_column)
        window = df.groupby(feature_hash).window()
        df['event_count'] = window['event_type'].count()
        df['event_number'] = window['event_type'].window_row_number()
        df = df.materialize()
        original_node = df.get_current_node(name='before_featureing')
        filter = df.event_number == 1
        df = df[filter]
        return df.drop(columns=['event_number']), original_node

    def create_sample_feature_frame(self, table_name, overwrite=False):
        """
        Create a df that contains only all unique combinations of the location stack and event_type. This
        allows for manipulating this data on a small data set, while all changes can be applied to all hits
        later. Use :py:meth:`apply_feature_frame_sample_changes` later to apply changes made in
        this ObjectivFrame.

        :param table_name: the name of the sql table to store the data of the unique location_stack and
            event_types.
        :param overwrite: if True, the sql table is overwritten if it already exists.
        :returns: an ObjectivFrame with only all unique combinations of the location stack and event_type.
        """
        df, original_node = self._prepare_sample()
        with df.engine.connect() as conn:
            if overwrite:
                sql = f'DROP TABLE IF EXISTS {quote_identifier(table_name)}'
                sql = escape_parameter_characters(conn, sql)
                conn.execute(sql)
            sql = f'create temporary table {quote_identifier(table_name)} as ({df.view_sql()})'
            sql = escape_parameter_characters(conn, sql)
            conn.execute(sql)

        new_base_node = SampleSqlModel(table_name=table_name, previous=original_node, name='feature_sample')

        sample_df = ObjectivFrame.get_instance(engine=df.engine,
                                               base_node=new_base_node,
                                               index_dtypes=df.index_dtypes,
                                               dtypes=df.dtypes,
                                               group_by=None,
                                               order_by=None)

        sample_df._time_aggregation = df._time_aggregation
        sample_df._start_date = df._start_date
        sample_df._end_date = df._end_date
        sample_df._conversion_events = df._conversion_events

        return sample_df

    def apply_feature_frame_sample_changes(self, feature_frame):
        """
        Returns a new ObjectivFrame in which all changes made in feature_frame are applied to the full data
        set.

        :param feature_frame: the sample ObjectivFrame made by :py:meth:`create_sample_feature_frame`.
        :returns: a new ObjectivFrame.
        """
        created_features = [x for x in feature_frame.data_columns if x not in ['location_stack',
                                                                               'event_type',
                                                                               'event_count']]
        df = feature_frame[['location_stack', 'event_type'] + created_features]
        df['feature_hash'] = df._hash_features()
        self['feature_hash'] = self._hash_features()

        return self.merge(df[created_features + ['feature_hash']].reset_index(drop=True), on='feature_hash')

    def stack_flows_from_feature_df(self,
                                    stack_column: str = None,
                                    count_method: str = 'sum'):
        """
        Function that calculates the links between contexts on the stack. It returns a DataFrame with the
        links 'from' and 'to' contexts. This function queries the database.

        :param stack_column: The column that contains the stack for which the links will be calculated. If
            None, the standard location stack column of an ObjectivFrame is used ('location_stack').
        :param count_method: The function for aggregating the data.
        """
        sampled_node_tuple = find_node(
            start_node=self.base_node,
            function=lambda node: isinstance(node, SampleSqlModel)
        )

        if sampled_node_tuple:
            if sampled_node_tuple[0].generic_name == 'feature_sample':
                df = self.copy_override()
            else:
                raise NotImplementedError('feature functions not available for sample data')
        else:
            df, _ = self._prepare_sample(location_stack_column=stack_column)
        if stack_column is None:
            stack_column = 'location_stack'
        df['feature_hash'] = df._hash_features(location_stack_column=stack_column)

        import pandas as pd
        pdf = df.to_pandas()
        contexts = pdf[stack_column].map(lambda x: [[a, y] for a, y in enumerate(x)]).explode()
        contexts.dropna(inplace=True)
        sankey_prep = pdf.join(pd.DataFrame(contexts.to_list(),
                                            index=contexts.index,
                                            columns=['context_index', 'context'])
                               ).reset_index()
        sankey_prep = sankey_prep[['feature_hash', 'context_index', 'context', 'event_count']].sort_values(
            'context_index', ascending=False)
        sankey_prep['source'] = sankey_prep.context.map(repr).astype('str')
        sankey_prep['target'] = sankey_prep.groupby('feature_hash')['source'].shift(1,
                                                                                    fill_value='end_of_stack')
        sankey_prep_agg = sankey_prep.groupby(['source', 'target'])['event_count'].agg(
            count_method).reset_index().rename(columns={'event_count': 'value'})
        categories = set(sankey_prep_agg['source']).union(set(sankey_prep_agg['target']))
        sankey_prep_agg['source'] = pd.Categorical(sankey_prep_agg['source'], categories=categories)
        sankey_prep_agg['target'] = pd.Categorical(sankey_prep_agg['target'], categories=categories)

        return sankey_prep_agg

    def display_sankey(self,
                       stack_column: str = None,
                       text_in_title: str = None,
                       node_color='blue'):
        """
        Display the Sankey chart of a location stack. This function queries the database.

        :param stack_column: The column for which to display the chart. If None the location stack with
            which the Feature Frame is initialized is selected.
        :param text_in_title: A text to display in the title of the graph.
        :param node_color: Optionally the color of the nodes can be adjusted.
        """
        if text_in_title is not None:
            text_in_title = str(text_in_title)

        if stack_column is None:
            stack_column = 'location_stack'
        df = self.stack_flows_from_feature_df(stack_column)
        return self._draw_sankey(df=df,
                                 text_in_title=text_in_title,
                                 node_color=node_color)

    @staticmethod
    def _draw_sankey(df,
                     text_in_title,
                     node_color):
        import plotly.graph_objects as go  # type: ignore
        import pandas as pd
        node = dict(
            pad=15,
            thickness=20,
            line=dict(color="black", width=0.5),
            label=df.source.cat.categories,
            color=node_color
        )
        link = pd.concat([df[['source', 'target']].apply(lambda x: x.cat.codes), df['value']],
                         axis=1).to_dict('list')
        fig = go.Figure(go.Sankey(arrangement="fixed", link=link, node=node), {'clickmode': 'event+select'})
        fig.update_layout(title_text=text_in_title, font_size=10)

        return fig

    def copy_override(self, **kwargs):
        """
        INTERNAL

        Overrides copy_override from Objectiv Bach, so that it carries the
        additional attributes from ObjectivFrame to the copy.
        """

        return super().copy_override(start_date=self._start_date,
                                     end_date=self._end_date,
                                     time_aggregation=self._time_aggregation,
                                     conversion_events=self._conversion_events,
                                     **kwargs)

    def materialize(self, **kwargs):
        """
        Overrides materialize from Objectiv Bach.

        It carries the additional attributes from ObjectivFrame to the materialized ObjectivFrame. See
        :py:meth:`bach.DataFrame.materialize` for documentation.

        :returns: ObjectivFrame with the current DataFrame's state as base_node
        """
        df = super().materialize(**kwargs)
        df._time_aggregation = self._time_aggregation  # type: ignore
        df._start_date = self._start_date  # type: ignore
        df._end_date = self._end_date  # type: ignore
        df._conversion_events = self._conversion_events  # type: ignore

        return df
