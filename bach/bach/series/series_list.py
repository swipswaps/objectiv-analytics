from typing import Dict, Optional, Any, TYPE_CHECKING

from bach import Series
from bach.expression import Expression
from sql_models.model import SqlModel

if TYPE_CHECKING:
    from bach.partitioning import GroupBy

class SeriesList(Series):
    dtype = 'list'
    dtype_aliases = ('list', list)
    db_engine_dtypes = {'postgresql': 'array',
                        'bigquery': 'array'}
    supported_value_types = (list,)

    def __init__(self, engine, base_node: SqlModel, index: Dict[str, 'Series'], name: str,
                 expression: Expression, group_by: Optional['GroupBy'],
                 sorted_ascending: Optional[bool] = None):

        if not isinstance(db_dtype, list):
            raise ValueError('Only list types supported in SeriesArray')

        super().__init__(engine, base_node, db_dtype, index, name, expression, group_by, sorted_ascending)

        # An array type has just one internal type, use that.
        from bach.types import get_series_type_from_db_dtype
        item_klass = get_series_type_from_db_dtype(db_dtype[0])
        self._item = item_klass(engine, base_node, db_dtype[0], index, name, expression,
                                group_by, sorted_ascending)

    @property
    def array(self):
        class ArrayOperator:

            def __init__(self, series):
                self._series: 'SeriesArray' = series

            def __getitem__(self, item):
                return self._series._item.copy_override(
                    expression=Expression.construct('{}[index({})]', self._series._item,
                                                    Series.value_to_expression(item)),
                    dtype=self._series._item.dtype
                )
        return ArrayOperator(self)

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
