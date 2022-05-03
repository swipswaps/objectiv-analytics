"""
Copyright 2022 Objectiv B.V.
"""
from bach.types_bq import bq_db_dtype_to_dtype


# TODO: get this from typing.py dynamically
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
