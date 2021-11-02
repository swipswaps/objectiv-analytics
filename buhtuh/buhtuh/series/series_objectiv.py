"""
Copyright 2021 Objectiv B.V.
"""
from typing import Optional, Dict, TYPE_CHECKING

from buhtuh.series import BuhTuhSeries, BuhTuhSeriesJsonb
from buhtuh.expression import Expression, quote_string, quote_identifier
from sql_models.model import SqlModel

if TYPE_CHECKING:
    from buhtuh.series import BuhTuhSeriesBoolean
    from buhtuh.partitioning import BuhTuhGroupBy


class ObjectivStack(BuhTuhSeriesJsonb.Json):
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


class BuhTuhSeriesGlobalContexts(BuhTuhSeriesJsonb):
    """ Test class for custom types. """
    dtype = 'global_context'
    return_dtype = dtype

    class GlobalContexts(ObjectivStack):
        return_dtype = 'global_context'

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
                 index: Dict[str, 'BuhTuhSeries'],
                 name: str,
                 expression: Expression,
                 group_by: 'BuhTuhGroupBy',
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


class BuhTuhSeriesLocationStack(BuhTuhSeriesJsonb):
    """ Test class for custom types. """
    dtype = 'location_stack'
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
            return self._series_object.copy_override(dtype='location_stack', expression=expression)

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
                 index: Dict[str, 'BuhTuhSeries'],
                 name: str,
                 expression: Expression,
                 group_by: 'BuhTuhGroupBy',
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
