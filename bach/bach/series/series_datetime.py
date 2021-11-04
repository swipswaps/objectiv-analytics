"""
Copyright 2021 Objectiv B.V.
"""
import datetime
from abc import ABC
from typing import Union, cast, TYPE_CHECKING

import numpy

from bach.series import Series, SeriesString
from bach.expression import Expression
from bach.series.series import WrappedPartition

if TYPE_CHECKING:
    from bach.series import SeriesBoolean


class SeriesAbstractDateTime(Series, ABC):
    """ Class all date/time/interval handling classes derive from to share common stuff """

    def _arithmetic_operation(self, other, operation, fmt_str, other_dtypes=(), dtype=None):
        ret_val = super()._arithmetic_operation(other, operation, fmt_str, other_dtypes, dtype)
        if ret_val.dtype == 'date':
            # PG returns timestamp in all cases were we expect date
            # Make sure we cast properly, and round similar to python datetime
            return ret_val.copy_override(
                expression=Expression.construct("cast({} + '12h'::interval as date)", ret_val))
        else:
            return ret_val


class SeriesTimestamp(SeriesAbstractDateTime):
    """
    Types in PG that we want to support: https://www.postgresql.org/docs/9.1/datatype-datetime.html
        timestamp without time zone
    """
    dtype = 'timestamp'
    dtype_aliases = ('datetime64', 'datetime64[ns]', numpy.datetime64)
    supported_db_dtype = 'timestamp without time zone'
    supported_value_types = (datetime.datetime, datetime.date, str)

    @classmethod
    def supported_value_to_expression(cls, value: Union[str, datetime.datetime]) -> Expression:
        value = str(value)
        # TODO: check here already that the string has the correct format
        return Expression.construct(
            'cast({} as timestamp without time zone)', Expression.string_value(value)
        )

    @classmethod
    def dtype_to_expression(cls, source_dtype: str, expression: Expression) -> Expression:
        if source_dtype == 'timestamp':
            return expression
        else:
            if source_dtype not in ['string', 'date']:
                raise ValueError(f'cannot convert {source_dtype} to timestamp')
            return Expression.construct(f'cast({{}} as {cls.supported_db_dtype})', expression)

    def _comparator_operation(self, other, comparator,
                              other_dtypes=('timestamp', 'date', 'string')) -> 'SeriesBoolean':
        return super()._comparator_operation(other, comparator, other_dtypes)

    def format(self, format_str: str) -> SeriesString:
        """
        Allow standard PG formatting of this Series (to a string type)

        :param format_str: Format as defined in https://www.postgresql.org/docs/14/functions-formatting.html
        :return: a derived Series that accepts and returns formatted timestamp strings
        """
        expression = Expression.construct(f"to_char({{}}, '{format_str}')", self)
        return self.copy_override(dtype='string', expression=expression)

    def __add__(self, other) -> 'Series':
        # add accepts only timedelta as rhs, and will yield same type
        return self._arithmetic_operation(other, 'add', '({}) + ({})', other_dtypes=tuple(['timedelta']))

    def __sub__(self, other) -> 'Series':
        # different rhs parameter types yield result in different return
        type_mapping = {
            'date': 'timedelta',
            'time': 'timestamp',
            'timedelta': 'timestamp',
            'timestamp': 'timedelta'
        }
        return self._arithmetic_operation(other, 'sub', '({}) - ({})',
                                          other_dtypes=tuple(type_mapping.keys()),
                                          dtype=type_mapping)


class SeriesDate(SeriesTimestamp):
    """
    Types in PG that we want to support: https://www.postgresql.org/docs/9.1/datatype-datetime.html
        date
    """
    dtype = 'date'
    dtype_aliases = tuple()  # type: ignore
    supported_db_dtype = 'date'
    supported_value_types = (datetime.datetime, datetime.date, str)

    @classmethod
    def supported_value_to_expression(cls, value: Union[str, datetime.date]) -> Expression:
        if isinstance(value, datetime.date):
            value = str(value)
        # TODO: check here already that the string has the correct format
        return Expression.construct(f'cast({{}} as date)', Expression.string_value(value))

    @classmethod
    def dtype_to_expression(cls, source_dtype: str, expression: Expression) -> Expression:
        if source_dtype == 'date':
            return expression
        else:
            if source_dtype not in ['string', 'timestamp']:
                raise ValueError(f'cannot convert {source_dtype} to date')
            return Expression.construct(f'cast({{}} as {cls.supported_db_dtype})', expression)

    def __add__(self, other) -> 'Series':
        type_mapping = {
            'time': 'timestamp',
            'timedelta': 'date'  # python datetime return date, PG timestamp
        }
        return self._arithmetic_operation(other, 'add', '({}) + ({})',
                                          other_dtypes=tuple(type_mapping.keys()),
                                          dtype=type_mapping)

    def __sub__(self, other) -> 'Series':
        type_mapping = {
            'date': 'timedelta',
            'time': 'timestamp',
            'timedelta': 'date',  # PG returns timestamp
            'timestamp': 'timedelta'
        }
        if other.dtype == 'date':
            raise ValueError('date - date operations are really broken in PG. Consider using timestamps')
        return self._arithmetic_operation(other, 'sub', '({}) - ({})',
                                          other_dtypes=tuple(type_mapping.keys()),
                                          dtype=type_mapping)


class SeriesTime(SeriesAbstractDateTime):
    """
    Types in PG that we want to support: https://www.postgresql.org/docs/9.1/datatype-datetime.html
        time without time zone
    """
    dtype = 'time'
    dtype_aliases = tuple()  # type: ignore
    supported_db_dtype = 'time without time zone'
    supported_value_types = (datetime.time, str)

    @classmethod
    def supported_value_to_expression(cls, value: Union[str, datetime.time]) -> Expression:
        value = str(value)
        # TODO: check here already that the string has the correct format
        return Expression.construct('cast({} as time without time zone)', Expression.string_value(value))

    @classmethod
    def dtype_to_expression(cls, source_dtype: str, expression: Expression) -> Expression:
        if source_dtype == 'time':
            return expression
        else:
            if source_dtype not in ['string', 'timestamp']:
                raise ValueError(f'cannot convert {source_dtype} to time')
            return Expression.construct(f'cast ({{}} as {cls.supported_db_dtype})', expression)

    def _comparator_operation(self, other, comparator, other_dtypes=('time', 'string')) -> 'SeriesBoolean':
        return super()._comparator_operation(other, comparator, other_dtypes)

    def __add__(self, other) -> 'Series':
        type_mapping = {
            'date': 'timestamp',
            'timedelta': 'time',
            'timestamp': 'timestamp'
        }
        return self._arithmetic_operation(other, 'add', '({}) + ({})',
                                          other_dtypes=tuple(type_mapping.keys()),
                                          dtype=type_mapping)

    def __sub__(self, other) -> 'Series':
        type_mapping = {
            'time': 'timestamp',
            'timedelta': 'time'
        }
        return self._arithmetic_operation(other, 'sub', '({}) - ({})',
                                          other_dtypes=tuple(type_mapping.keys()),
                                          dtype=type_mapping)


class SeriesTimedelta(SeriesAbstractDateTime):
    dtype = 'timedelta'
    dtype_aliases = ('interval',)
    supported_db_dtype = 'interval'
    supported_value_types = (datetime.timedelta, numpy.timedelta64, str)

    @classmethod
    def supported_value_to_expression(
            cls,
            value: Union[str, numpy.timedelta64, datetime.timedelta]
    ) -> Expression:
        value = str(value)
        # TODO: check here already that the string has the correct format
        return Expression.construct('cast({} as interval)', Expression.string_value(value))

    @classmethod
    def dtype_to_expression(cls, source_dtype: str, expression: Expression) -> Expression:
        if source_dtype == 'timedelta':
            return expression
        else:
            if not source_dtype == 'string':
                raise ValueError(f'cannot convert {source_dtype} to timedelta')
            return Expression.construct('cast({} as interval)', expression)

    def format(self, format_str) -> SeriesString:
        """
        Allow standard PG formatting of this Series (to a string type)

        :param format_str: Format as defined in https://www.postgresql.org/docs/9.1/functions-formatting.html
        :return: a derived Series that accepts and returns formatted timestamp strings
        """
        expression = Expression.construct(f"to_char({{}}, '{format_str}')", self)
        return self.copy_override(dtype='string', expression=expression)

    def _comparator_operation(self, other, comparator,
                              other_dtypes=('timedelta', 'date', 'time', 'string')) -> 'SeriesBoolean':
        return super()._comparator_operation(other, comparator, other_dtypes)

    def __add__(self, other) -> 'Series':
        type_mapping = {
            'date': 'date',  # PG makes this a timestamp
            'time': 'time',  # not supported by python datetime, but PG is okay with it
            'timedelta': 'timedelta',
            'timestamp': 'timestamp'
        }
        return self._arithmetic_operation(other, 'add', '({}) + ({})',
                                          other_dtypes=tuple(type_mapping.keys()),
                                          dtype=type_mapping)

    def __sub__(self, other) -> 'Series':
        type_mapping = {
            'date': 'timedelta',
            'time': 'timedelta',
            'timedelta': 'timedelta',
        }
        return self._arithmetic_operation(other, 'sub', '({}) - ({})',
                                          other_dtypes=tuple(type_mapping.keys()),
                                          dtype=type_mapping)

    def __mul__(self, other) -> 'Series':
        return self._arithmetic_operation(other, 'mul', '({}) * ({})', other_dtypes=('int64', 'float64'))

    def __truediv__(self, other) -> 'Series':
        return self._arithmetic_operation(other, 'div', '({}) / ({})', other_dtypes=('int64', 'float64'))

    def sum(self, partition: WrappedPartition = None,
            skipna: bool = True, min_count: int = None) -> 'SeriesTimedelta':
        result = self._derived_agg_func(
            partition=partition,
            expression=Expression.construct('sum({})', self.expression),
            skipna=skipna,
            min_count=min_count
        )
        return cast('SeriesTimedelta', result)

    def mean(self, partition: WrappedPartition = None, skipna: bool = True) -> 'SeriesTimedelta':
        result = self._derived_agg_func(
            partition=partition,
            expression=Expression.construct('avg({})', self.expression),
            skipna=skipna
        )
        return cast('SeriesTimedelta', result)
