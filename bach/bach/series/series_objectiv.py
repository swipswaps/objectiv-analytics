"""
Copyright 2021 Objectiv B.V.
"""
from typing import Optional, Dict, TYPE_CHECKING, List

from bach.series import Series, SeriesJsonb, SeriesString, SeriesBoolean
from bach.expression import Expression, quote_string, quote_identifier
from sql_models.model import SqlModel


from bach import DataFrame
from sql_models.sql_generator import to_sql


# sankey imports
import pandas as pd
import plotly.graph_objects as go

if TYPE_CHECKING:
    from bach.partitioning import GroupBy


class ObjectivStack(SeriesJsonb.Json):
    def get_from_context_with_type_series(self, type, key, dtype='string'):
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
            return self.get_from_context_with_type_series("CookieIdContext", "cookie_id")

        @property
        def user_agent(self):
            return self.get_from_context_with_type_series("HttpContext", "user_agent")

        @property
        def application(self):
            return self.get_from_context_with_type_series("ApplicationContext", "id")

    def __init__(self,
                 engine,
                 base_node: SqlModel,
                 index: Dict[str, 'Series'],
                 name: str,
                 expression: Expression,
                 group_by: 'GroupBy',
                 sorted_ascending: Optional[bool] = None):
        super().__init__(engine=engine,
                         base_node=base_node,
                         index=index,
                         name=name,
                         expression=expression,
                         group_by=group_by,
                         sorted_ascending=sorted_ascending)
        self.objectiv = ObjectivStack(self)
        self.global_contexts = self.GlobalContexts(self)
        self.gc = self.global_contexts


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
            return self[{'_type': 'NavigationContext'}: None]

        @property
        def feature_stack(self):
            keys = ['_type', 'id']
            jsonb_build_object_str = [f"{quote_string(key)}, value -> {quote_string(key)}" for key in keys]
            expression_str = f'''(select jsonb_agg(jsonb_build_object({", ".join(jsonb_build_object_str)}))
            from jsonb_array_elements({{}}))'''
            expression = Expression.construct(
                expression_str,
                self._series_object
            )
            return self._series_object.copy_override(dtype='objectiv_location_stack', expression=expression)

        @property
        def nice_name(self):
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

    def __init__(self,
                 engine,
                 base_node: SqlModel,
                 index: Dict[str, 'Series'],
                 name: str,
                 expression: Expression,
                 group_by: 'GroupBy',
                 sorted_ascending: Optional[bool] = None):
        super().__init__(engine=engine,
                         base_node=base_node,
                         index=index,
                         name=name,
                         expression=expression,
                         group_by=group_by,
                         sorted_ascending=sorted_ascending)
        self.objectiv = ObjectivStack(self)
        self.location_stack = self.LocationStack(self)
        self.ls = self.location_stack


class FeatureFrame:
    """
    class that is based on Bach DataFrame. It shares basic functionality with Bach DataFrame, but it is
    solely focussed on feature creation. It allows you to create features on a small dataset and write them
    to the entire dataset when done.
    """
    def __init__(self, bt, feature_bt, location_stack_column, event_column):
        self._original_bt = bt
        self._bt = feature_bt
        self.location_stack_column = location_stack_column
        self.event_column = event_column

    @classmethod
    def from_data_frame(cls, bt, location_stack_column, event_column):
        event_series, location_stack_series = cls.check_supported(bt, location_stack_column, event_column)

        feature_bt = location_stack_series.to_frame()
        feature_bt[event_column] = event_series
        feature_bt['feature_hash'] = cls.hash_features(feature_bt, location_stack_column, event_column)

        expression_str = "count({}) over (partition by {})"
        expression = Expression.construct(
            expression_str,
            feature_bt['feature_hash'],
            feature_bt['feature_hash']
        )
        feature_bt['event_count'] = location_stack_series.copy_override(dtype='int64', expression=expression)

        expression_str = "row_number() over (partition by {})"
        expression = Expression.construct(
            expression_str,
            feature_bt['feature_hash']
        )
        feature_bt['event_number'] = location_stack_series.copy_override(dtype='int64', expression=expression)
        feature_bt = feature_bt.materialize('features')

        feature_bt = feature_bt[feature_bt.event_number == 1][[location_stack_column,
                                                               event_column,
                                                               'feature_hash',
                                                               'event_count']]

        # todo create table of smaller data set here and return bt object of that table (like get_sample)

        feature_bt = feature_bt.set_index('feature_hash')

        return FeatureFrame(bt, feature_bt, location_stack_column, event_column)

    @staticmethod
    def check_supported(bt, location_stack_column, event_column):
        if not isinstance(bt[event_column], SeriesString):
            raise TypeError('only string supported for event column')
        if isinstance(bt[location_stack_column], SeriesLocationStack):
            location_stack_series = bt[location_stack_column]
        elif isinstance(bt[location_stack_column], SeriesJsonb):
            location_stack_series = bt[location_stack_column].astype('objectiv_location_stack')
        else:
            raise TypeError('only jsonb type supported for location column')

        return bt[event_column], location_stack_series.ls.feature_stack

    @classmethod
    def hash_features(cls, bt, location_stack_column, event_column):
        event_series, location_stack_series = cls.check_supported(bt, location_stack_column, event_column)
        expression_str = "md5(concat({} #>> {}, {}))"
        expression = Expression.construct(
            expression_str,
            location_stack_series,
            Expression.string_value('{}'),
            event_series
        )
        return location_stack_series.copy_override(dtype='string', expression=expression)

    def write_to_full_frame(self):
        created_features = [x for x in self._bt.data_columns if x not in [self.location_stack_column,
                                                                          self.event_column,
                                                                          'event_count']]


        feature_hash = self.hash_features(self._original_bt,
                                          self.location_stack_column,
                                          self.event_column)

        self._original_bt['feature_hash'] = feature_hash


        return self._original_bt.merge(self._bt[created_features], left_on='feature_hash', right_index=True)


    # todo maybe move these functions to locationstackseries, as you have to select the column now anyway
    def stack_flows_from_feature_df(self,
                                    stack_column: str = None,
                                    count_method: str = 'sum'):
        """
        Function that calculates the links between contexts on the
        stack. It returns a DataFrame with the links 'from' and 'to'
        contexts. Optionally, the method that determines the 'strength'
        of the links can be deteermined with 'to_count' and 'count_method'

        Parameters
        ----------
        df : DataFrame
            The DataFrame that contains a stack.

        feature_column : str
            The column that contains the stack for which the links
            will be calculated.

        to_count : str
            This columns on which the count_method will be applied.

        count_method : str
            The function for aggregating the data.
        """


        df = self._bt.to_pandas()
        if stack_column is None:
            stack_column = self.location_stack_column
        contexts = df[stack_column].map(lambda x: [[a, y] for a, y in enumerate(x)]).explode()
        contexts.dropna(inplace=True)
        sankey_prep = df.join(pd.DataFrame(contexts.to_list(),
                                    index=contexts.index,
                                    columns=['context_index', 'context'])
                       ).reset_index()

        sankey_prep = sankey_prep[['feature_hash','context_index','context','event_count']].sort_values('context_index', ascending=False)
        sankey_prep['source'] = sankey_prep.context.map(repr).astype('str')
        sankey_prep['target'] = sankey_prep.groupby(['feature_hash'])['source'].shift(1, fill_value='end_of_stack')
        sankey_prep_agg = sankey_prep.groupby(['source','target'])['event_count'].agg(count_method).reset_index().rename(columns={'event_count':'value'})
        categories = set(sankey_prep_agg['source']).union(set(sankey_prep_agg['target']))
        sankey_prep_agg['source'] = pd.Categorical(sankey_prep_agg['source'], categories=categories)
        sankey_prep_agg['target'] = pd.Categorical(sankey_prep_agg['target'], categories=categories)

        return sankey_prep_agg

    def display_sankey(self,
                       stack_column: str = None,
                       text_in_title=None,
                       node_color='blue'):
        """
        Display the Sankey chart using some standards to be
        reused in the Sankey app.

        Parameters
        ----------
        df : DataFrame
            The to graph. This needs to be in the format as specified
            by the stack_flows_from_feature_df function.

        text_in_title : str
            A text to display in the title of the graph.

        node_color : str
            Optionally the color of the nodes can be adjusted.
        """

        if text_in_title is not None:
            text_in_title = str(text_in_title)

        if stack_column is None:
            stack_column = self.location_stack_column
        df = self.stack_flows_from_feature_df(stack_column)
        node = dict(
            pad=15,
            thickness=20,
            line=dict(color="black", width=0.5),
            label=df.source.cat.categories,
            color=node_color
        )
        link = pd.concat([df[['source', 'target']].apply(lambda x: x.cat.codes), df['value']], axis=1).to_dict('list')
        fig = go.Figure(go.Sankey(arrangement="fixed", link=link, node=node), {'clickmode': 'event+select'})
        fig.update_layout(title_text=text_in_title, font_size=10)
        return fig

    def __getitem__(self, *args, **kwargs):
        bt = self._bt.__getitem__(*args, **kwargs)
        if isinstance(*args, (SeriesBoolean, slice)):
            return FeatureFrame(self._original_bt,
                                bt,
                                self.location_stack_column,
                                self.event_column)
        else:
            return bt

    def __setitem__(self, *args, **kwargs):
        return self._bt.__setitem__(*args, **kwargs)

    def view_sql(self, *args, **kwargs):
        return self._bt.view_sql(*args, **kwargs)

    def head(self, *args, **kwargs):
        return self._bt.head(*args, **kwargs)

    def to_pandas(self, *args, **kwargs):
        return self._bt.to_pandas(*args, **kwargs)

    def rename(self, *args, **kwargs):
        return self._bt.rename(*args, **kwargs)

    def drop(self, *args, **kwargs):
        return self._bt.drop(*args, **kwargs)

    def sort_values(self, *args, **kwargs):
        return self._bt.sort_values(*args, **kwargs)

    # SUPPORTED AGGREGATES
    def count(self, *args, **kwargs):
        return self._bt.count(*args, **kwargs)

    def nunique(self, *args, **kwargs):
        return self._bt.nunique(*args, **kwargs)




