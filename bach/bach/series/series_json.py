"""
Copyright 2021 Objectiv B.V.
"""
import json
from typing import Optional, Dict, Union, TYPE_CHECKING, Any

from bach.series import Series, const_to_series
from bach.expression import Expression
from sql_models.util import quote_string, quote_identifier
from sql_models.model import SqlModel

if TYPE_CHECKING:
    from bach.series import SeriesBoolean
    from bach.partitioning import GroupBy


class SeriesJsonb(Series):
    """
    this a proper class, not just a string subclass
    """
    dtype = 'jsonb'
    dtype_to_pandas = None

    # todo can only assign a type to one series type, and object is quite generic
    dtype_aliases = tuple()  # type: ignore
    supported_db_dtype = 'jsonb'
    supported_value_types = (dict, list)
    return_dtype = dtype

    class Json:
        def __init__(self, series_object):
            self._series_object = series_object

        def __getitem__(self, key: Union[str, int, slice]):
            if isinstance(key, int):
                return self._series_object.copy_override(
                    dtype=self._series_object.return_dtype,
                    expression=Expression.construct(f'{{}}->{key}', self._series_object)
                )
            elif isinstance(key, str):
                return self.get_value(key)
            elif isinstance(key, slice):
                expression_references = 0
                if key.step:
                    raise NotImplementedError('slice steps not supported')
                if key.stop is not None:
                    negative_stop = ''
                    if isinstance(key.stop, int):
                        if key.stop < 0:
                            negative_stop = f'jsonb_array_length({{}})'
                            expression_references += 1
                        stop = f'{negative_stop} {key.stop} - 1'
                    elif isinstance(key.stop, (dict, str)):
                        stop = self._find_in_json_list(key.stop)
                        expression_references += 1
                    else:
                        raise TypeError('cant')
                if key.start is not None:
                    if isinstance(key.start, int):
                        negative_start = ''
                        if key.start < 0:
                            negative_start = f'jsonb_array_length({{}})'
                            expression_references += 1
                        start = f'{negative_start} {key.start}'
                    elif isinstance(key.start, (dict, str)):
                        start = self._find_in_json_list(key.start)
                        expression_references += 1
                    else:
                        raise TypeError('cant')
                    if key.stop is not None:
                        where = f'between {start} and {stop}'
                    else:
                        where = f'>= {start}'
                else:
                    where = f'<= {stop}'
                combined_expression = f"""(select jsonb_agg(x.value)
                from jsonb_array_elements({{}}) with ordinality x
                where ordinality - 1 {where})"""
                expression_references += 1
                return self._series_object.copy_override(
                    dtype=self._series_object.return_dtype,
                    expression=Expression.construct(
                        combined_expression,
                        *([self._series_object] * expression_references)
                    ))
            raise TypeError(f'key should be int or slice, actual type: {type(key)}')

        def _find_in_json_list(self, key: Union[str, Dict[str, str]]):
            if isinstance(key, (dict, str)):
                key = json.dumps(key)
                quoted_key = quote_string(key)
                expression_str = f"""(select min(case when ({quoted_key}::jsonb) <@ value
                then ordinality end) -1 from jsonb_array_elements({{}}) with ordinality)"""
                return expression_str
            else:
                raise TypeError(f'key should be int or slice, actual type: {type(key)}')

        def get_value(self, key: str, as_str=False):
            '''
            as_str: if True, it returns a string, else json
            '''
            return_as_string_operator = ''
            return_dtype = self._series_object.return_dtype
            if as_str:
                return_as_string_operator = '>'
                return_dtype = 'string'
            expression = Expression.construct(f"{{}}->{return_as_string_operator}{{}}",
                                              self._series_object,
                                              Expression.string_value(key))
            return self._series_object.copy_override(dtype=return_dtype, expression=expression)

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
        self.json = self.Json(self)

    @classmethod
    def supported_value_to_expression(cls, value: Union[dict, list]) -> Expression:
        json_value = json.dumps(value)
        return Expression.construct('cast({} as jsonb)', Expression.string_value(json_value))

    @classmethod
    def dtype_to_expression(cls, source_dtype: str, expression: Expression) -> Expression:
        if source_dtype in ['jsonb', 'json']:
            return expression
        if source_dtype != 'string':
            raise ValueError(f'cannot convert {source_dtype} to jsonb')
        return Expression.construct('cast({} as jsonb)', expression)

    def _comparator_operation(self, other, comparator, other_dtypes=('json', 'jsonb')):
        return self._binary_operation(
            other, operation=f"comparator '{comparator}'",
            fmt_str=f'cast({{}} as jsonb) {comparator} cast({{}} as jsonb)',
            other_dtypes=other_dtypes, dtype='bool'
        )

    def __le__(self, other) -> 'SeriesBoolean':
        return self._comparator_operation(other, "<@")

    def __ge__(self, other) -> 'SeriesBoolean':
        return self._comparator_operation(other, "@>")


class SeriesJson(SeriesJsonb):
    """
    this a proper class, not just a string subclass
    """
    dtype = 'json'
    dtype_aliases = tuple()  # type: ignore
    supported_db_dtype = 'json'
    return_dtype = 'jsonb'

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
                         expression=Expression.construct(f'cast({{}} as jsonb)', expression),
                         group_by=group_by,
                         sorted_ascending=sorted_ascending)
