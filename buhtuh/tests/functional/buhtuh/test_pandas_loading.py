"""
Copyright 2021 Objectiv B.V.
"""
from buhtuh import BuhTuhSeriesInt64, BuhTuhSeriesString, BuhTuhSeriesFloat64, BuhTuhSeriesBoolean, \
    BuhTuhSeriesTimestamp
from tests.functional.buhtuh.test_data_and_utils import _get_bt, assert_db_type

import datetime


def test_all_supported_types():
    TEST_DATA_SUPPORTED_TYPES = [
        [1.32, 4, datetime.datetime(2015, 12, 13, 9, 54, 45, 543), 'fierljeppen', True]
    ]
    bt = _get_bt('test_supported_types_table',
                 TEST_DATA_SUPPORTED_TYPES,
                 ['float_column', 'int_column', 'timestamp_column', 'string_column', 'bool_column'],
                 convert_objects=True)

    assert_db_type(bt['float_column'], 'double precision', BuhTuhSeriesFloat64)
    assert_db_type(bt['int_column'], 'bigint', BuhTuhSeriesInt64)
    assert_db_type(bt['timestamp_column'], 'timestamp without time zone', BuhTuhSeriesTimestamp)
    assert_db_type(bt['string_column'], 'text', BuhTuhSeriesString)
    assert_db_type(bt['bool_column'], 'boolean', BuhTuhSeriesBoolean)


def test_all_supported_types_with_dtype_override():
    TEST_DATA_SUPPORTED_TYPES = [
        [4, 'fierljeppen']
    ]
    bt = _get_bt('test_supported_types_table',
                 TEST_DATA_SUPPORTED_TYPES,
                 ['int_column', 'string_column'],
                 dtype_override={'string_column': 'string'},
                 convert_objects=False)

    # todo still fails, see comments at dtype_override in pandasql.py
    assert_db_type(bt['int_column'], 'double precision', BuhTuhSeriesFloat64)
    assert_db_type(bt['string_column'], 'text', BuhTuhSeriesString)


def test_string_as_index():
    TEST_DATA_SUPPORTED_TYPES = [
        ['fierljeppen', 1.32, 4, datetime.datetime(2015, 12, 13, 9, 54, 45, 543), True]
    ]
    bt = _get_bt('test_supported_types_table',
                 TEST_DATA_SUPPORTED_TYPES,
                 ['string_column', 'float_column', 'int_column', 'timestamp_column', 'bool_column'],
                 convert_objects=True)

    assert_db_type(bt['float_column'], 'double precision', BuhTuhSeriesFloat64)
    assert_db_type(bt['int_column'], 'bigint', BuhTuhSeriesInt64)
    assert_db_type(bt['timestamp_column'], 'timestamp without time zone', BuhTuhSeriesTimestamp)
    assert_db_type(bt['string_column'], 'text', BuhTuhSeriesString)
    assert_db_type(bt['bool_column'], 'boolean', BuhTuhSeriesBoolean)


def test_load_df_without_conversion():
    TEST_DATA_SUPPORTED_TYPES = [
        [1.32, 4, datetime.datetime(2015, 12, 13, 9, 54, 45, 543), True]
    ]
    bt = _get_bt('test_supported_types_table',
                 TEST_DATA_SUPPORTED_TYPES,
                 ['float_column', 'int_column', 'timestamp_column', 'bool_column'],
                 convert_objects=False)

    assert_db_type(bt['float_column'], 'double precision', BuhTuhSeriesFloat64)
    assert_db_type(bt['int_column'], 'bigint', BuhTuhSeriesInt64)
    assert_db_type(bt['timestamp_column'], 'timestamp without time zone', BuhTuhSeriesTimestamp)
    assert_db_type(bt['bool_column'], 'boolean', BuhTuhSeriesBoolean)