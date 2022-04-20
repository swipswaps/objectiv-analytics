"""
Copyright 2022 Objectiv B.V.
"""
from datetime import timedelta

from numpy import timedelta64

from bach import SeriesTimedelta
from bach.expression import Expression


def test_supported_value_to_literal(dialect):
    def assert_call(value, expected_token_value: str):
        result = SeriesTimedelta.supported_value_to_literal(dialect, value)
        assert result == Expression.string_value(expected_token_value)

    assert_call(timedelta(seconds=1234),                                '0-0 0 00:20:34.000000')
    assert_call(timedelta(seconds=1234, microseconds=1234),             '0-0 0 00:20:34.001234')
    assert_call(timedelta(days=5, seconds=1234, microseconds=1234),     '0-0 5 00:20:34.001234')
    assert_call(timedelta(days=-5, seconds=1234, microseconds=1234),    '0-0 -5 00:20:34.001234')
    assert_call(timedelta(days=365, seconds=1234, microseconds=1234),   '0-0 365 00:20:34.001234')
    assert_call(timedelta(days=50_000, seconds=123, microseconds=9),    '0-0 50000 00:02:03.000009')

    assert_call(timedelta64(1234, 's'),                                                   '0-0 0 00:20:34.000000')
    assert_call(timedelta64(1234, 's') + timedelta64(1234, 'us'),                         '0-0 0 00:20:34.001234')
    assert_call(timedelta64(5, 'D') + timedelta64(1234, 's') + timedelta64(1234, 'us'),   '0-0 5 00:20:34.001234')
    assert_call(timedelta64(-5, 'D') + timedelta64(1234, 's') + timedelta64(1234, 'us'),  '0-0 -5 00:20:34.001234')
    assert_call(timedelta64(365, 'D') + timedelta64(1234, 's') + timedelta64(1234, 'us'), '0-0 365 00:20:34.001234')
    assert_call(timedelta64(50_000, 'D') + timedelta64(123, 's') + timedelta64(9, 'us'),  '0-0 50000 00:02:03.000009')

    # Special cases: Not-a-Time will be represented as NULL, and NULL itself
    nat = timedelta64('NaT')
    assert SeriesTimedelta.supported_value_to_literal(dialect, nat) == Expression.construct('NULL')
    assert SeriesTimedelta.supported_value_to_literal(dialect, None) == Expression.construct('NULL')
