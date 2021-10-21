"""
Copyright 2021 Objectiv B.V.
"""
import json
from typing import Optional, Dict, Union, TYPE_CHECKING

from buhtuh.series import BuhTuhSeries, const_to_series
from buhtuh.expression import Expression
from buhtuh.json import Json
from sql_models.model import SqlModel

if TYPE_CHECKING:
    from buhtuh import BuhTuhSeriesBoolean


class BuhTuhSeriesJsonb(BuhTuhSeries):
    """
    this a proper class, not just a string subclass
    """
    dtype = 'jsonb'
    # todo can only assign a type to one series type, and object is quite generic
    dtype_aliases = tuple()  # type: ignore
    supported_db_dtype = 'jsonb'
    supported_value_types = (dict, list)

    def __init__(self,
                 engine,
                 base_node: SqlModel,
                 index: Optional[Dict[str, 'BuhTuhSeries']],
                 name: str,
                 expression: Expression = None,
                 sorted_ascending: Optional[bool] = None):
        super().__init__(engine,
                         base_node,
                         index,
                         name,
                         expression,
                         sorted_ascending)
        self.json = Json(self)

    @classmethod
    def supported_value_to_expression(cls, value: Union[dict, list]) -> Expression:
        json_value = json.dumps(value)
        return Expression.construct('cast({} as jsonb)', Expression.string_value(json_value))

    @classmethod
    def from_dtype_to_sql(cls, source_dtype: str, expression: Expression) -> Expression:
        if source_dtype in ['jsonb', 'json']:
            return expression
        if source_dtype != 'string':
            raise ValueError(f'cannot convert {source_dtype} to jsonb')
        return Expression.construct('cast({} as jsonb)', expression)

    def _comparator_operator(self, other, comparator):
        other = const_to_series(base=self, value=other)
        self._check_supported(f"comparator '{comparator}'", ['json', 'jsonb'], other)
        expression = Expression.construct(
            f'cast({{}} as jsonb) {comparator} cast({{}} as jsonb)',
            self.expression, other.expression
        )
        return self._get_derived_series('bool', expression)

    def __le__(self, other) -> 'BuhTuhSeriesBoolean':
        return self._comparator_operator(other, "<@")


class BuhTuhSeriesJson(BuhTuhSeriesJsonb):
    """
    this a proper class, not just a string subclass
    """
    dtype = 'json'
    dtype_aliases = tuple()  # type: ignore
    supported_db_dtype = 'json'

    def __init__(self,
                 engine,
                 base_node: SqlModel,
                 index: Optional[Dict[str, 'BuhTuhSeries']],
                 name: str,
                 expression: Expression = None,
                 sorted_ascending: Optional[bool] = None):

        if expression is None:
            expression = Expression.column_reference(name)

        super().__init__(engine,
                         base_node,
                         index,
                         name,
                         Expression.construct(f'cast({{}} as jsonb)', expression),
                         sorted_ascending)
