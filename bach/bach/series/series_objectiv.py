"""
Copyright 2021 Objectiv B.V.
"""
from typing import Optional, Dict, TYPE_CHECKING, List

from bach.series import Series, SeriesJsonb, SeriesString
from bach.expression import Expression, quote_string, quote_identifier
from sql_models.model import SqlModel


from bach import DataFrame


from sql_models.sql_generator import to_sql


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
        feature_bt = feature_bt.get_df_materialized_model('features')

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
            print(event_column)
            raise TypeError('only string supported for event column')
        if isinstance(bt[location_stack_column], SeriesLocationStack):
            location_stack_series = bt[location_stack_column]
        elif isinstance(bt[location_stack_column], SeriesJsonb):
            location_stack_series = bt[location_stack_column].astype('objectiv_location_stack')
        else:
            raise TypeError('only jsonb type supported for location column')

        return bt[event_column], location_stack_series

    @classmethod
    def hash_features(cls, bt, location_stack_column, event_column):
        event_series, location_stack_series = cls.check_supported(bt, location_stack_column, event_column)
        expression_str = "md5(concat({} #>> {}, {}))"
        expression = Expression.construct(
            expression_str,
            location_stack_series.ls.feature_stack,
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

        print(self._bt[created_features].head())

        return self._original_bt.merge(self._bt[created_features], left_on='feature_hash', right_index=True)

    def __getitem__(self, *args):
        return self._bt.__getitem__(*args)

    def __getattr__(self, *args):
        return self._bt.__getattr__(*args)

    def __setitem__(self, *args):
        return self._bt.__setitem__(*args)

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
