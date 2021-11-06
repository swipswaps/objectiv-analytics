"""
Copyright 2021 Objectiv B.V.
"""
from abc import ABC
from typing import cast, Union, TYPE_CHECKING, Optional

import numpy

from bach.series import Series
from bach.expression import Expression, AggregateFunctionExpression
from bach.series.series import WrappedPartition

if TYPE_CHECKING:
    from bach.series import SeriesBoolean


class SeriesAbstractNumeric(Series, ABC):
    """
    Base class that defines shared logic between SeriesInt64 and SeriesFloat64
    """
    dtype_to_pandas = None  # Let pandas choose.

    def _arithmetic_operation(self, other, operation, fmt_str,
                              other_dtypes=('int64', 'float64'), dtype=None):
        return super()._arithmetic_operation(other, operation, fmt_str, other_dtypes, dtype)

    def _comparator_operation(self, other, comparator, other_dtypes=('int64', 'float64')) -> 'SeriesBoolean':
        return super()._comparator_operation(other, comparator, other_dtypes)

    def round(self, decimals: int = 0) -> 'SeriesAbstractNumeric':
        return self.copy_override(
            expression=Expression.construct(f'round(cast({{}} as numeric), {decimals})', self)
        )

    def _ddof_unsupported(self, ddof: Optional[int]):
        if ddof is not None and ddof != 1:
            raise NotImplementedError("ddof != 1 currently not implemented")

    def kurt(self, partition: WrappedPartition = None, skipna: bool = True):
        return self.kurtosis(partition, skipna)

    def kurtosis(self, partition: WrappedPartition = None, skipna: bool = True):
        raise NotImplementedError("kurtosis currently not implemented")

    def mad(self, partition: WrappedPartition = None, skipna: bool = True):
        raise NotImplementedError("mad currently not implemented")

    def prod(self, partition: WrappedPartition = None, skipna: bool = True):
        return self.product(partition, skipna)

    def product(self, partition: WrappedPartition = None, skipna: bool = True):
        # https://stackoverflow.com/questions/13156055/product-aggregate-in-postgresql
        # horrible solution, but best we have until we support custom defined aggregates
        return self._derived_agg_func(
            partition,
            AggregateFunctionExpression.construct(f'exp(sum(ln({{}})))', self),
            skipna=skipna
        )

    def skew(self, partition: WrappedPartition = None, skipna: bool = True):
        raise NotImplementedError("skew currently not implemented")

    def sem(self, partition: WrappedPartition = None, skipna: bool = True, ddof: int = None):
        self._ddof_unsupported(ddof)
        return self._derived_agg_func(
            partition,
            AggregateFunctionExpression.construct(f'{{}}/sqrt({{}})',
                                                  self.std(partition, skipna=skipna, ddof=ddof),
                                                  self.count(partition, skipna=skipna)),
            skipna=skipna
        )

    def std(self, partition: WrappedPartition = None, skipna: bool = True, ddof: int = None):
        # sample standard deviation of the input values
        self._ddof_unsupported(ddof)
        return self._derived_agg_func(partition, 'stddev_samp', skipna=skipna)

    def sum(self, partition: WrappedPartition = None, skipna: bool = True, min_count: int = None):
        return self._derived_agg_func(partition, 'sum', skipna=skipna, min_count=min_count)

    def mean(self, partition: WrappedPartition = None, skipna: bool = True) -> 'SeriesFloat64':
        return cast('SeriesFloat64',  # for the mypies
                    self._derived_agg_func(partition, 'avg', 'double precision', skipna=skipna))

    def var(self, partition: WrappedPartition = None, skipna: bool = True, ddof: int = None):
        # sample variance of the input values (square of the sample standard deviation)
        self._ddof_unsupported(ddof)
        return self._derived_agg_func(partition, 'var_samp', skipna=skipna)


class SeriesInt64(SeriesAbstractNumeric):
    dtype = 'int64'
    dtype_aliases = ('integer', 'bigint', 'i8', int, numpy.int64)
    supported_db_dtype = 'bigint'
    supported_value_types = (int, numpy.int64)

    @classmethod
    def supported_value_to_expression(cls, value: int) -> Expression:
        # A stringified integer is a valid integer or bigint literal, depending on the size. We want to
        # consistently get bigints, so always cast the result
        # See the section on numeric constants in the Postgres documentation
        # https://www.postgresql.org/docs/14/sql-syntax-lexical.html#SQL-SYNTAX-CONSTANTS
        return Expression.construct('cast({} as bigint)', Expression.raw(str(value)))

    @classmethod
    def dtype_to_expression(cls, source_dtype: str, expression: Expression) -> Expression:
        if source_dtype == 'int64':
            return expression
        if source_dtype not in ['float64', 'bool', 'string']:
            raise ValueError(f'cannot convert {source_dtype} to int64')
        return Expression.construct('cast({} as bigint)', expression)

    def _arithmetic_operation(self, other, operation, fmt_str, other_dtypes=('int64', 'float64'), dtype=None):
        # Override this method, because we need to return a float if we interact with one.
        type_mapping = dtype if dtype else {
            'int64': 'int64',
            'float64': 'float64'
        }
        return super()._arithmetic_operation(other, operation, fmt_str, other_dtypes, type_mapping)

    def __truediv__(self, other) -> 'Series':
        return self._arithmetic_operation(other, 'div', 'cast({} as float) / ({})', dtype='float64')

    def __rshift__(self, other):
        return self._arithmetic_operation(other, 'lshift', '({}) >> cast({} as int)',
                                          other_dtypes=tuple(['int64']))

    def __lshift__(self, other):
        return self._arithmetic_operation(other, 'lshift', '({}) << cast({} as int)',
                                          other_dtypes=tuple(['int64']))

    def sum(self, partition: WrappedPartition = None, skipna: bool = True, min_count: int = None):
        # sum() has the tendency to return float on bigint arguments. Cast it back.
        series = super().sum(partition, skipna, min_count)
        return series.copy_override(
            expression=Expression.construct('cast({} as bigint)', series.expression))


class SeriesFloat64(SeriesAbstractNumeric):
    dtype = 'float64'
    dtype_aliases = ('float', 'double', 'f8', float, numpy.float64, 'double precision')
    supported_db_dtype = 'double precision'
    supported_value_types = (float, numpy.float64)

    @classmethod
    def supported_value_to_expression(cls, value: Union[float, numpy.float64]) -> Expression:
        # Postgres will automatically parse any number with a decimal point as a number of type `numeric`,
        # which could be casted to float. However we specify the value always as a string, as there are some
        # values that cannot be expressed as a numeric literal directly (NaN, infinity, and -infinity), and
        # a value that cannot be represented as numeric (-0.0).
        # See the sections on numeric constants, and on fLoating-point types in the Postgres documentation
        # https://www.postgresql.org/docs/14/sql-syntax-lexical.html#SQL-SYNTAX-CONSTANTS
        # https://www.postgresql.org/docs/14/datatype-numeric.html#DATATYPE-FLOAT
        str_value = str(value)
        return Expression.construct("cast({} as float)", Expression.string_value(str_value))

    @classmethod
    def dtype_to_expression(cls, source_dtype: str, expression: Expression) -> Expression:
        if source_dtype == 'float64':
            return expression
        if source_dtype not in ['int64', 'string']:
            raise ValueError(f'cannot convert {source_dtype} to float64')
        return Expression.construct('cast({} as float)', expression)
