"""
Copyright 2021 Objectiv B.V.
"""
import datetime
from typing import Union, cast, TYPE_CHECKING

import numpy

from bach import DataFrame
from bach.series import Series, SeriesString, const_to_series
from bach.expression import Expression
from bach.series.series import WrappedPartition

if TYPE_CHECKING:
    from bach.partitioning import GroupBy


class SeriesTimestamp(Series):
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

    def _comparator_operator(self, other, comparator):
        other = const_to_series(base=self, value=other)
        self._check_supported(f"comparator '{comparator}'", ['timestamp', 'date', 'string'], other)
        expression = Expression.construct(f'({{}}) {comparator} ({{}})', self, other)
        return self.copy_override(dtype='bool', expression=expression)

    def format(self, format) -> SeriesString:
        """
        Allow standard PG formatting of this Series (to a string type)

        :param format: The format as defined in https://www.postgresql.org/docs/14/functions-formatting.html
        :return: a derived Series that accepts and returns formatted timestamp strings
        """
        expression = Expression.construct(f"to_char({{}}, '{format}')", self)
        return self.copy_override(dtype='string', expression=expression)

    def __sub__(self, other) -> 'SeriesTimestamp':
        other = const_to_series(base=self, value=other)
        self._check_supported('sub', ['timestamp', 'date', 'time'], other)
        expression = Expression.construct('({}) - ({})', self, other)
        return self.copy_override(dtype='timedelta', expression=expression)


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


class SeriesTime(Series):
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

    def _comparator_operator(self, other, comparator):
        from bach.series import const_to_series
        other = const_to_series(base=self, value=other)
        self._check_supported(f"comparator '{comparator}'", ['time', 'string'], other)
        expression = Expression.construct(f'({{}}) {comparator} ({{}})', self, other)
        return self.copy_override(dtype='bool', expression=expression)


class SeriesTimedelta(Series):
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

    def _comparator_operator(self, other, comparator):
        other = const_to_series(base=self, value=other)
        self._check_supported(f"comparator '{comparator}'", ['timedelta', 'date', 'time', 'string'], other)
        expression = Expression.construct(f'({{}}) {comparator} ({{}})', self, other)
        return self.copy_override(dtype='bool', expression=expression)

    def format(self, format) -> SeriesString:
        """
        Allow standard PG formatting of this Series (to a string type)

        :param format: The format as defined in https://www.postgresql.org/docs/9.1/functions-formatting.html
        :return: a derived Series that accepts and returns formatted timestamp strings
        """
        expression = Expression.construct(f"to_char({{}}, '{format}')", self)
        return self.copy_override(dtype='string', expression=expression)

    def __add__(self, other) -> 'SeriesTimedelta':
        other = const_to_series(base=self, value=other)
        self._check_supported('add', ['timedelta', 'timestamp', 'date', 'time'], other)
        expression = Expression.construct('({}) + ({})', self, other)
        return self.copy_override(dtype='timedelta', expression=expression)

    def __sub__(self, other) -> 'SeriesTimedelta':
        other = const_to_series(base=self, value=other)
        self._check_supported('sub', ['timedelta', 'timestamp', 'date', 'time'], other)
        expression = Expression.construct('({}) - ({})', self, other)
        return self.copy_override(dtype='timedelta', expression=expression)

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
