from typing import Dict, Optional, Any

from bach import Series
from bach.expression import Expression
from sql_models.model import SqlModel


class SeriesDict(Series):
    dtype = 'dict'
    dtype_aliases = (dict)
    db_engine_dtypes = {'postgresql': 'row',
                        'bigquery': 'RECORD'}
    supported_value_types = (dict,)

    def __init__(self, engine, base_node: SqlModel, db_dtype: Any, index: Dict[str, 'Series'], name: str,
                 expression: Expression, group_by: Optional['GroupBy'],
                 sorted_ascending: Optional[bool] = None):

        if not isinstance(db_dtype, dict):
            raise ValueError('Only dict types supported in SeriesArray')

        super().__init__(engine, base_node, db_dtype, index, name, expression, group_by, sorted_ascending)

        # An dict is a named index of types, create the type dict.
        from bach.types import get_series_type_from_db_dtype
        self._items = {}
        for name, dbt in db_dtype:
            item_klass = get_series_type_from_db_dtype(dbt)
            self._items[name] = item_klass(engine, base_node, dbt, index, name, expression,
                                           group_by, sorted_ascending)

    @property
    def array(self):
        class DictOperator:

            def __init__(self, series):
                self._series: 'SeriesDict' = series

            def __getitem__(self, item):
                return self._series._item.copy_override(
                    expression=Expression.construct('{}[index({})]', self._series._item,
                                                    Series.value_to_expression(item)),
                    dtype=self._series._item.dtype
                )
        return DictOperator(self)

    @classmethod
    def supported_value_to_expression(cls, value: list[Series]) -> Expression:
        # TODO
        return Expression.raw(str(value))

    @classmethod
    def dtype_to_expression(cls, source_dtype: str, expression: Expression) -> Expression:
        # TODO
        if source_dtype == 'bool':
            return expression
        if source_dtype not in ['int64', 'string']:
            raise ValueError(f'cannot convert {source_dtype} to bool')
        return Expression.construct('cast({} as bool)', expression)
