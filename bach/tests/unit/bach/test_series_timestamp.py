"""
Copyright 2022 Objectiv B.V.
"""
import datetime

import numpy
import pytest

from bach import SeriesTimestamp
from bach.expression import StringValueToken, Expression


def test_supported_value_to_literal(dialect):
    def assert_call(value, expected_token_value: str):
        """
        Assert that supported_value_to_literal() for the given value return an expression with a single
        string token, which has the expected value.
        """
        result = SeriesTimestamp.supported_value_to_literal(dialect, value)
        assert isinstance(result, Expression)
        assert len(result.data) == 1
        token = result.data[0]
        assert isinstance(token, StringValueToken)
        assert token.value == expected_token_value

    # ## datetime
    assert_call(datetime.datetime(1999, 1, 15, 13, 37, 1, 23), '1999-01-15 13:37:01.000023')
    assert_call(datetime.datetime(1969, 12, 31, 1, 2, 3, 00),  '1969-12-31 01:02:03.000000')
    assert_call(datetime.datetime(2050, 7, 7, 7, 7, 7, 7),     '2050-07-07 07:07:07.000007')

    # TODO: datetime with timezone set

    # ## date
    assert_call(datetime.date(1999, 1, 15),  '1999-01-15 00:00:00.000000')
    assert_call(datetime.date(1969, 12, 31), '1969-12-31 00:00:00.000000')
    assert_call(datetime.date(2050, 7, 7),   '2050-07-07 00:00:00.000000')

    # ## np.datetime64
    assert_call(numpy.datetime64('2022-01-01 12:34:56.7800'),                   '2022-01-01 12:34:56.780000')
    assert_call(numpy.datetime64('2022-01-03'),                                 '2022-01-03 00:00:00.000000')
    assert_call(numpy.datetime64('1995-03-31 01:33:37.123456'),                 '1995-03-31 01:33:37.123456')
    # datetime64 objects with differing precision. We only support up to milliseconds
    assert_call(numpy.datetime64('1995-03-31 01:33:37.1234567'),                '1995-03-31 01:33:37.123457')
    assert_call(numpy.datetime64('1995-03-31 01:33:37.123456789012', 's'),      '1995-03-31 01:33:37.000000')
    assert_call(numpy.datetime64('1995-03-31 01:33:37.123456789012', 'ms'),     '1995-03-31 01:33:37.123000')
    assert_call(numpy.datetime64('1995-03-31 01:33:37.123456789012', 'us'),     '1995-03-31 01:33:37.123456')
    assert_call(numpy.datetime64('1995-03-31 01:33:37.123456789012', 'ns'),     '1995-03-31 01:33:37.123457')
    # Special case: Not-a-Time will be represented as NULL
    result_nat = SeriesTimestamp.supported_value_to_literal(dialect, numpy.datetime64('NaT'))
    assert result_nat == Expression.construct('NULL')

    # ## strings
    assert_call('2022-01-01 12:34:56.7800',    '2022-01-01 12:34:56.780000')
    assert_call('1995-03-31 01:33:37.123456',  '1995-03-31 01:33:37.123456')
    assert_call('1999-12-31 23:59:59',         '1999-12-31 23:59:59.000000')
    assert_call('1999-12-31 23:59',            '1999-12-31 23:59:00.000000')
    assert_call('2022-01-03',                  '2022-01-03 00:00:00.000000')

    # ## None
    result_nat = SeriesTimestamp.supported_value_to_literal(dialect, None)
    assert result_nat == Expression.construct('NULL')


def test_supported_value_to_literal_str_non_happy_path(dialect):
    with pytest.raises(ValueError, match='Not a valid datetime string literal'):
        SeriesTimestamp.supported_value_to_literal(dialect, '2022-01-03 aa:bb')

    with pytest.raises(ValueError, match='Not a valid datetime string literal'):
        SeriesTimestamp.supported_value_to_literal(dialect, '01/03/99 12:13:00')

    with pytest.raises(ValueError, match='Not a valid datetime string literal'):
        SeriesTimestamp.supported_value_to_literal(dialect, '01/03/99 12:13:00')
