"""
Copyright 2022 Objectiv B.V.
"""
import pytest

from bach.types_bq import bq_db_dtype_to_dtype

# TODO: get this from types.py dynamically
SCALAR_MAPPING = {
    'BOOL': 'bool',
    'INT64': 'int64',
    'FLOAT64': 'float64',
    'STRING': 'string',
    'TIMESTAMP': 'timestamp',
    'DATE': 'date',
    'TIME': 'time',
    'ARRAY': 'array',  # not an actual scalar, but test should still pass
    'STRUCT': 'struct'
}


def test_basic_types():
    assert bq_db_dtype_to_dtype('STRING', SCALAR_MAPPING) == 'string'
    assert bq_db_dtype_to_dtype('INT64', SCALAR_MAPPING) == 'int64'
    assert bq_db_dtype_to_dtype('TIMESTAMP', SCALAR_MAPPING) == 'timestamp'
    assert bq_db_dtype_to_dtype('BOOL', SCALAR_MAPPING) == 'bool'


def test_struct_types():
    db_dtype = 'ARRAY<STRUCT<_type STRING, _types STRING, cookie_id STRING, event_id STRING, global_contexts STRING, location_stack STRING, time INT64>> '
    expected_dtype = [
        {
            '_type': 'string',
            '_types': 'string',
            'cookie_id': 'string',
            'event_id': 'string',
            'global_contexts': 'string',
            'location_stack': 'string',
            'time': 'int64'
        }
    ]
    assert bq_db_dtype_to_dtype(db_dtype, SCALAR_MAPPING) == expected_dtype


def test_nested_types():
    db_dtype = 'ARRAY<STRUCT<date DATE, winning_time_seconds INT64, persons ARRAY<STRUCT<name STRING, isWinner BOOL, times ARRAY<STRUCT<city STRING, seconds INT64>>, equipment STRUCT<skates STRUCT<manufacturer STRING, clap BOOL>, hat BOOL, layers INT64>>>>>'
    expected_dtype = [
        {
            'date': 'date',
            'winning_time_seconds': 'int64',
            'persons': [
                {
                    'name': 'string',
                    'isWinner': 'bool',
                    'times': [
                        {
                            'city': 'string',
                            'seconds': 'int64'
                        }
                    ],
                    'equipment': {
                        'hat': 'bool',
                        'layers': 'int64',
                        'skates': {
                            'clap': 'bool',
                            'manufacturer': 'string'
                        }
                    }
                }
            ]
        }
    ]
    assert bq_db_dtype_to_dtype(db_dtype, SCALAR_MAPPING) == expected_dtype


def test_non_happy_path():
    with pytest.raises(ValueError, match='found no token'):
        bq_db_dtype_to_dtype('', SCALAR_MAPPING)

    with pytest.raises(ValueError, match='Unexpected token'):
        bq_db_dtype_to_dtype('blabla', SCALAR_MAPPING)

    with pytest.raises(ValueError, match='Expected token "<"'):
        bq_db_dtype_to_dtype('STRUCT', SCALAR_MAPPING)

    with pytest.raises(ValueError, match='Expected token ">"'):
        bq_db_dtype_to_dtype('STRUCT<', SCALAR_MAPPING)

    with pytest.raises(ValueError, match='Expected token ">"'):
        bq_db_dtype_to_dtype('STRUCT<a INT64', SCALAR_MAPPING)

    with pytest.raises(ValueError, match='Unexpected tokens after last parsed tokens'):
        bq_db_dtype_to_dtype('STRUCT<a INT64>>', SCALAR_MAPPING)

    with pytest.raises(ValueError):
        bq_db_dtype_to_dtype('STRUCT<a INT64> bla bla bla', SCALAR_MAPPING)
