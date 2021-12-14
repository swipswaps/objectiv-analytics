"""
Copyright 2021 Objectiv B.V.
"""
from bach.series import SeriesJsonb
from bach.expression import Expression, quote_string, quote_identifier
from bach.sql_model import SampleSqlModel
from bach import DataFrame
from bach.types import register_dtype, get_dtype_from_db_dtype
from bach_open_taxonomy.stack.util import sessionized_data_model
from sql_models.graph_operations import find_node
from bach.dataframe import escape_parameter_characters


class ObjectivStack(SeriesJsonb.Json):
    def get_from_context_with_type_series(self, type: str, key: str, dtype='string'):
        """
        Returns the value of `key` from the first context in an Objectiv stack where `_type` matches `type`.

        :param type: the _type to search for in the contexts of the stack.
        :param key: the value of the key to return of the context with matching type.
        :param dtype: the dtype of the series to return.
        :returns: a series of type `dtype`
        """
        expression_str = f'''
        jsonb_path_query_first({{}},
        \'$[*] ? (@._type == $type)\',
        \'{{"type":{quote_identifier(type)}}}\') ->> {{}}'''
        expression = Expression.construct(
            expression_str,
            self._series_object,
            Expression.string_value(key)
        )
        return self._series_object.copy_override(dtype=dtype, expression=expression)


@register_dtype(value_types=[], override_registered_types=True)
class SeriesGlobalContexts(SeriesJsonb):
    """
    Objectiv Global Contexts series. This series type contains functionality specific to the Objectiv Global
    Contexts.
    """
    dtype = 'objectiv_global_context'
    return_dtype = dtype

    class GlobalContexts(ObjectivStack):
        @property
        def cookie_id(self):
            """
            Returns cookie id from the global contexts.
            """
            return self.get_from_context_with_type_series("CookieIdContext", "cookie_id")

        @property
        def user_agent(self):
            """
            Returns user agent string from the global contexts.
            """
            return self.get_from_context_with_type_series("HttpContext", "user_agent")

        @property
        def application(self):
            """
            Returns application id from the global contexts.
            """
            return self.get_from_context_with_type_series("ApplicationContext", "id")

    @property
    def objectiv(self):
        """
        Accessor for Objectiv stack data. All methods of :py:attr:`json` can also be accessed with this
        accessor. Same as :py:attr:`obj`

        .. autoclass:: bach_open_taxonomy.series.ObjectivStack
            :members:
            :noindex:

        """
        return ObjectivStack(self)

    @property
    def obj(self):
        """
        Accessor for Objectiv stack data. All methods of :py:attr:`json` can also be accessed with this
        accessor. Same as :py:attr:`objectiv`

        .. autoclass:: bach_open_taxonomy.series.ObjectivStack
            :members:
            :noindex:

        """
        return ObjectivStack(self)

    @property
    def global_contexts(self):
        """
        Accessor for Objectiv global context data. All methods of :py:attr:`json` and :py:attr:`objectiv` can
        also be accessed with this accessor. Same as :py:attr:`gc`

        .. autoclass:: bach_open_taxonomy.series.SeriesGlobalContexts.GlobalContexts
            :members:

        """
        return self.GlobalContexts(self)

    @property
    def gc(self):
        """
        Accessor for Objectiv global context data. All methods of :py:attr:`json` and :py:attr:`objectiv` can
        also be accessed with this accessor. Same as :py:attr:`global_contexts`

        .. autoclass:: bach_open_taxonomy.series.SeriesGlobalContexts.GlobalContexts
            :members:
            :noindex:

        """
        return self.GlobalContexts(self)


@register_dtype([], override_registered_types=True)
class SeriesLocationStack(SeriesJsonb):
    """
    Objectiv Location Stack series. This series type contains functionality specific to the Objectiv Location
    Stack.
    """
    dtype = 'objectiv_location_stack'
    return_dtype = dtype

    class LocationStack(ObjectivStack):
        @property
        def navigation_features(self):
            """
            Returns the navigation stack from the location stack.
            """
            return self[{'_type': 'NavigationContext'}: None]

        @property
        def feature_stack(self):
            """
            Returns the feature stack from the location stack. The context objects only contain the `_type`
            and a `id` key.
            """
            keys = ['_type', 'id']
            jsonb_build_object_str = [f"{quote_string(key)}" for key in keys]
            expression_str = f'''(
                select jsonb_agg((
                    select json_object_agg(items.key, items.value)
                    from jsonb_each(objects.value) as items
                    where items.key in ({", ".join(jsonb_build_object_str)})))
                from jsonb_array_elements({{}}) as objects)
            '''
            expression = Expression.construct(
                expression_str,
                self._series_object
            )
            return self._series_object.copy_override(dtype='objectiv_location_stack', expression=expression)

        @property
        def nice_name(self):
            """
            Returns a nice name for the location stack. This is a human readable name for the data in the
            feature stack.
            """
            expression = Expression.construct(
                f"""(
                select array_to_string(
                    array_agg(
                        replace(
                            regexp_replace(value ->> '_type', '([a-z])([A-Z])', '\\1 \\2', 'g'),
                        ' Context', '') || ': ' || (value ->> 'id')
                    ),
                ' => ')
                from jsonb_array_elements({{}}) with ordinality
                where ordinality = jsonb_array_length({{}})) || case
                    when jsonb_array_length({{}}) > 1
                        then ' located at ' || (select array_to_string(
                    array_agg(
                        replace(
                            regexp_replace(value ->> '_type', '([a-z])([A-Z])', '\\1 \\2', 'g'),
                        ' Context', '') || ': ' || (value ->> 'id')
                    ),
                ' => ')
                from jsonb_array_elements({{}}) with ordinality
                where ordinality < jsonb_array_length({{}})
                ) else '' end""",
                self._series_object,
                self._series_object,
                self._series_object,
                self._series_object,
                self._series_object
            )
            return self._series_object.copy_override(dtype='string', expression=expression)

    @property
    def objectiv(self):
        """
        Accessor for Objectiv stack data. All methods of :py:attr:`json` can also be accessed with this
        accessor. Same as :py:attr:`obj`

        .. autoclass:: bach_open_taxonomy.series.SeriesLocationStack.LocationStack
            :members:
            :noindex:

        """
        return ObjectivStack(self)

    @property
    def obj(self):
        """
        Accessor for Objectiv stack data. All methods of :py:attr:`json` can also be accessed with this
        accessor. Same as :py:attr:`objectiv`

        .. autoclass:: bach_open_taxonomy.series.ObjectivStack
            :members:
            :noindex:

        """
        return ObjectivStack(self)

    @property
    def location_stack(self):
        """
        Accessor for Objectiv location stack data. All methods of :py:attr:`json` and :py:attr:`objectiv`
        can also be accessed with this accessor. Same as :py:attr:`ls`

        .. autoclass:: bach_open_taxonomy.series.SeriesLocationStack.LocationStack
            :members:

        """
        return self.LocationStack(self)

    @property
    def ls(self):
        """
        Accessor for Objectiv location stack data. All methods of :py:attr:`json` and :py:attr:`objectiv` can
        also be accessed with this accessor. Same as :py:attr:`location_stack`

        .. autoclass:: bach_open_taxonomy.series.SeriesLocationStack.LocationStack
            :members:
            :noindex:

        """
        return self.LocationStack(self)


class ModelHub:
    def __init__(self, df):
        self._df = df

    @staticmethod
    def build_frame(one: 'BachSeries', other: 'BachSeries'):
        """
        Buids a dataframe from two series with the same index. Can be used for series that are returned from
        the model hub
        """
        df = one.to_frame()
        if one.base_node == other.base_node:
            df[other.name] = other
        else:
            # todo also 'moment' or new column name for aggregation?
            if len(one.index.keys()) == 1 and one.index.keys() == other.index.keys():
                df = df.merge(other, left_index=True, right_index=True)

        return df

    class Aggregate:
        """
        filter param takes SeriesBoolean. filter methods always return SeriesBoolean.
        """

        def __init__(self, df):
            self._df = df

        def _generic_aggregation(self, time_aggregation, column, filter, f):
            if not time_aggregation:
                time_aggregation = self._df.time_aggregation
            gb = self._df.moment.dt.sql_format(time_aggregation) if time_aggregation else None
            df = self._df.copy_override()
            if filter:
                df['_filter'] = filter
                if filter.expression.has_windowed_aggregate_function:
                    df = df.materialize()
                df = df[df._filter]

                f = f + '_' + filter.name

            series = df.groupby(gb)[column].nunique()
            return series.copy_override(name=f)

        def unique_users(self, time_aggregation: str = None, filter: 'SeriesBoolean' = None):
            """
            Use any template for aggreation from: https://www.postgresql.org/docs/14/functions-formatting.html
            ie. ``time_aggregation=='YYYYMMDD' aggregates by date.
            :param time_aggregation: if None, it uses the time_aggregation set in ObjectivFrame.
            """
            return self._generic_aggregation(time_aggregation=time_aggregation,
                                             column='user_id',
                                             filter=filter,
                                             f='unique_users')

        def unique_sessions(self, time_aggregation: str = None, filter: 'SeriesBoolean' = None):
            """
            Use any template for aggreation from: https://www.postgresql.org/docs/14/functions-formatting.html
            ie. ``time_aggregation=='YYYYMMDD' aggregates by date.
            :param time_aggregation: if None, it uses the time_aggregation set in ObjectivFrame.
            """
            return self._generic_aggregation(time_aggregation=time_aggregation,
                                             column='session_id',
                                             filter=filter,
                                             f='unique_sessions')

    class Filter:
        """
        methods in this class can be used as filters in aggregation models.
        always return SeriesBoolean
        """

        def __init__(self, df):
            self._df = df

        def is_first_session(self) -> 'SeriesBoolean':
            # todo think about materialization. if df contains a column created like this can't always be
            #  used for aggreagations
            # todo can we allow another timeframe for this (like not start_date and end_date)?
            window = self._df.groupby('user_id').window()
            first_session = window['session_id'].min()
            series = first_session == self._df.session_id
            return series.copy_override(name='is_first_session')

        def conversion(self, name):
            conversion_stack, conversion_event = self._df.conversion_events[name]

            if conversion_stack is None:
                series = self._df.event_type == conversion_event
            elif conversion_event is None:
                series = conversion_stack.notnull()
            else:
                series = ((conversion_stack.notnull()) & (self._df.event_type == conversion_event))
            return series.copy_override(name='conversion')
            # todo add conversion count over a windows like session , user etc

    @property
    def f(self):
        return self.Filter(self._df)

    @property
    def filter(self):
        return self.Filter(self._df)

    @property
    def agg(self):
        return self.Aggregate(self._df)

    @property
    def aggregate(self):
        return self.Aggregate(self._df)


class ObjectivFrame(DataFrame):
    # TODO get_sample returns a normal DataFrame
    # TODO it is possible to change event_type and location_stack, but they are assumed to contain expected
    #  data in this ObjectivFrame
    def __init__(self, **kwargs):
        try:
            self.time_aggregation = kwargs.pop('time_aggregation')
        except KeyError:
            pass
        try:
            self.conversion_events = kwargs.pop('conversion_events')
        except KeyError:
            pass
        super().__init__(**kwargs)

    @property
    def model_hub(self):
        return ModelHub(self)

    @property
    def mh(self):
        return ModelHub(self)

    @classmethod
    def from_table(cls,
                   engine,
                   start_date=None,
                   end_date=None,
                   time_aggregation: str = None) -> 'ObjectivFrame':
        """
        :param engine: an sqlalchemy engine for the database.
        :param time_aggregation: can be used to set a default aggregation timeframe interval that is used for
            models that use aggregation. Ie. YYYYMMDD aggregates to days (dates). Setting it to None
            aggregates over the entire selected dataset.
        """
        # todo time_aggregation is very loosely defined (using postgres formatting) and also returns string.
        #  maybe better to give a few options (month, day, hour, quarter etc).
        table_name = 'data'  # todo make this a parameter

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
            raise KeyError(f'Expected columns not in table {table_name}')

        index_dtype = {'event_id': dtypes.pop('event_id')}
        # remove key that don't end up in final data.
        dtypes.pop('value')
        dtypes['user_id'] = dtypes.pop('cookie_id')

        model = sessionized_data_model(start_date=start_date, end_date=end_date)

        dtypes.update({'session_id': 'int64',
                       'session_hit_number': 'int64',
                       'global_contexts': 'jsonb',
                       'location_stack': 'jsonb',
                       'event_type': 'string',
                       'stack_event_types': 'jsonb'})

        df = cls.get_instance(engine=engine,
                              base_node=model,
                              index_dtypes=index_dtype,
                              dtypes=dtypes,
                              group_by=None
                              )

        df.time_aggregation = time_aggregation
        df.conversion_events = {}

        df['global_contexts'] = df.global_contexts.astype('objectiv_global_context')
        df['location_stack'] = df.location_stack.astype('objectiv_location_stack')

        return df

    def add_conversion_event(self,
                             conversion_stack: 'SeriesLocationStack' = None,
                             conversion_event: str = None,
                             name: str = None):
        if conversion_stack is None and conversion_event is None:
            raise ValueError('At least one of conversion_stack or conversion_event should be set.')

        if not name:
            name = f'conversion_{len(self.conversion_events) + 1}'

        self.conversion_events[name] = conversion_stack, conversion_event

    @staticmethod
    def from_model():
        raise NotImplementedError('Use ObjectivFrame.from_table(engine) to instantiate')

    @staticmethod
    def from_pandas():
        raise NotImplementedError('Use ObjectivFrame.from_table(engine) to instantiate')

    def _hash_features(self, location_stack_column='location_stack'):
        expression_str = "md5(concat({} #>> {}, {}))"
        expression = Expression.construct(
            expression_str,
            self[location_stack_column].ls.feature_stack,
            Expression.string_value('{}'),
            self.event_type
        )
        return self[location_stack_column].copy_override(dtype='string', expression=expression)

    def _prepare_sample(self, location_stack_column='location_stack'):
        df = self[[location_stack_column, 'event_type']]
        df[location_stack_column] = df[location_stack_column].ls.feature_stack
        feature_hash = df._hash_features(location_stack_column=location_stack_column)
        window = df.groupby(feature_hash).window()
        df['event_count'] = window['event_type'].count()
        df['event_number'] = window['event_type'].window_row_number()
        df = df.materialize('features')
        original_node = df.get_current_node(name='before_featureing')
        filter = df.event_number == 1
        df = df[filter]
        return df.drop(columns=['event_number']), original_node

    def create_sample_feature_frame(self, table_name, overwrite=False):
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

        sample_df.time_aggregation = df.time_aggregation
        sample_df.start_date = start_date
        sample_df.end_date = end_date

        return sample_df

    # def apply_feature_frame_sample_changes(self, feature_frame):
    #     # todo some assertions that this works
    #     # todo this way would be nice if we can apply changes directly on top of self (instead of merge)
    #     #  merge is super slow
    #
    #     created_features = [x for x in feature_frame.data_columns if x not in ['location_stack',
    #                                                                   'event_type',
    #                                                                   'event_count']]
    #
    #     return self.merge(feature_frame.get_unsampled()[created_features], left_index=True,
    #     right_index=True)

    def apply_feature_frame_sample_changes(self, feature_frame):
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

        :param stack_column: The column that contains the stack for which the links will be calculated.
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

        :param: stack_column. The column for which to display the chart. If None the location stack with
            which the Feature Frame is initialized is selected.
        :param text_in_title: A text to display in the title of the graph.
        :param node_color: Optionally the color of the nodes can be adjusted.
        """
        import pandas as pd
        import plotly.graph_objects as go  # type: ignore
        if text_in_title is not None:
            text_in_title = str(text_in_title)

        if stack_column is None:
            stack_column = 'location_stack'
        df = self.stack_flows_from_feature_df(stack_column)
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
        return super().copy_override(time_aggregation=self.time_aggregation,
                                     conversion_events=self.conversion_events,
                                     **kwargs)
