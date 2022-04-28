"""
Copyright 2022 Objectiv B.V.
"""
from typing import Any, Tuple, List, Union, TYPE_CHECKING, TypeVar

from sqlalchemy.engine import Dialect

from bach.series import Series
from bach.expression import Expression, join_expressions
from bach.types import DtypeOrAlias, value_to_dtype, get_series_type_from_dtype, StructuredDtype, Dtype
from sql_models.constants import DBDialect
from sql_models.util import is_postgres, DatabaseNotSupportedException, is_bigquery


if TYPE_CHECKING:
    from bach import SeriesInt64, DataFrameOrSeries
    from bach.partitioning import GroupBy


T = TypeVar('T', bound='SeriesArray')


class SeriesArray(Series):
    dtype = 'array'
    dtype_aliases: Tuple[DtypeOrAlias, ...] = tuple()
    supported_db_dtype = {
        # TODO: some dynamic stuff here, to detect types like `bigint[]` as an array
        DBDialect.POSTGRES: 'ARRAY',
        DBDialect.BIGQUERY: 'ARRAY',
    }
    supported_value_types = (list, )

    @classmethod
    def supported_literal_to_expression(cls, dialect: Dialect, literal: Expression) -> Expression:
        return literal

    @classmethod
    def supported_value_to_literal(
        cls,
        dialect: Dialect,
        value: List[Any],
        dtype: StructuredDtype
    ) -> Expression:
        if not isinstance(value, list):
            raise ValueError(f'Type not supported: {type(value)}')

        if len(value) == 0:
            sub_exprs = []
            # default. TODO: alternative function that allows to set this
            sub_dtype = 'string'
            sub_db_dtype = get_series_type_from_dtype(sub_dtype).get_db_dtype(dialect)
        else:
            # TODO: track additional typing, about sub-types. Figure out how to do this as this function
            # is a classmethod
            sub_dtypes = set(value_to_dtype(item) for item in value)
            if len(sub_dtypes) != 1:
                raise ValueError(f'List has inconsistent sub-types, found: {sub_dtypes}')
            sub_dtype = list(sub_dtypes)[0]
            sub_db_dtype = get_series_type_from_dtype(sub_dtype).get_db_dtype(dialect)
            series_type = get_series_type_from_dtype(sub_dtype)
            sub_exprs = [
                series_type.value_to_expression(dialect=dialect, value=item, dtype=sub_dtype)
                for item in value
            ]

        if is_postgres(dialect):
            if not sub_exprs:
                return Expression.construct(f'ARRAY[]::{sub_db_dtype}[]',)
            return Expression.construct('ARRAY[{}]', join_expressions(expressions=sub_exprs, join_str=', '))
        if is_bigquery(dialect):
            if not sub_exprs:
                return Expression.construct(f'ARRAY<{sub_db_dtype}>[]', )
            return Expression.construct('[{}]', join_expressions(expressions=sub_exprs, join_str=', '))
        raise DatabaseNotSupportedException(dialect)

    @classmethod
    def dtype_to_expression(cls, dialect: Dialect, source_dtype: str, expression: Expression) -> Expression:
        if source_dtype == 'array':
            return expression
        raise ValueError(f'cannot convert {source_dtype} to array.')

    @property
    def arr(self) -> 'ArrayAccessor':
        # TODO: what is a good name for this property? We already have Series.array. Although that seems like
        #  something we should remove. It probably doesn't make sense to name this `array`
        #  `arr` is perhaps to piratey? Maybe `elements` ?
        return ArrayAccessor(self)


class ArrayAccessor:
    def __init__(self, series: SeriesArray):
        self._series = series

    def __getitem__(self, key: Union[int, slice]):
        # TODO: do we also want to support Series as key?
        engine = self._series.engine
        if isinstance(key, int):
            # TODO: track dtype properly
            if is_postgres(engine):
                # postgres uses 1-based numbering [1]
                # [1] https://www.postgresql.org/docs/current/arrays.html#ARRAYS-ACCESSING
                expr_str = f'{{}}[{key + 1}]'
            elif is_bigquery(engine):
                expr_str = f'{{}}[OFFSET({key})]'
            else:
                raise DatabaseNotSupportedException(engine)

            expression = Expression.construct(expr_str, self._series)
            # TODO: extract this logic
            assert isinstance(self._series.instance_dtype, list) and len(self._series.instance_dtype) == 1
            sub_dtype = self._series.instance_dtype[0]
            if isinstance(sub_dtype, Dtype):
                new_dtype = sub_dtype
                return self._series \
                    .copy_override_dtype(dtype=new_dtype) \
                    .copy_override(expression=expression)
            elif isinstance(sub_dtype, list) and len(sub_dtype) == 1:
                return self._series \
                    .copy_override(instance_dtype=sub_dtype) \
                    .copy_override(expression=expression)
            elif isinstance(sub_dtype, dict):
                # TODO: this type doesn't exist yet!
                return self._series \
                    .copy_override_dtype('todo') \
                    .copy_override(instance_dtype=sub_dtype) \
                    .copy_override(expression=expression)
            else:
                raise Exception(f'Unexpected type of sub_dtype. sub_dtype: {sub_dtype}')

            return self._series \
                .copy_override_dtype(dtype='string') \
                .copy_override(expression=Expression.construct(expr_str, self._series))

        elif isinstance(key, slice):
            # TODO: should be easy on Postgres
            # TODO: could be a lot of work on BigQuery for a nice solution.
            #   or we can just concat a lot of __getitem__s
            return self._series
        else:
            raise ValueError(f'Invalid key type: {type(key)}')

    def len(self) -> 'SeriesInt64':
        engine = self._series.engine
        if is_postgres(engine):
            # array_length on an empty array gives NULL, so use coalesce to always get an integer
            expr_str = 'coalesce(array_length({}, 1), 0)'
        elif is_bigquery(engine):
            expr_str = 'ARRAY_LENGTH({})'
        else:
            raise DatabaseNotSupportedException(engine)
        from bach import SeriesInt64
        return self._series \
            .copy_override_type(SeriesInt64) \
            .copy_override(expression=Expression.construct(expr_str, self._series))
