"""
Copyright 2022 Objectiv B.V.
"""
from bach.series import SeriesDict
from tests.functional.bach.test_data_and_utils import get_df_with_test_data, assert_equals_data


def test_basic_value_to_expression(engine):

    # TODO: works on bigquery only. Do we want to make this BigQuery only, or fallback to json for pg?
    # Or do more magic in PG to support this partially?

    df = get_df_with_test_data(engine)[['skating_order']]
    df = df.sort_index()[:1].materialize()
    struct = {
        'a': 123,
        'b': 'test',
        'c': 123.456
    }
    dtype={'a': 'int64', 'b': 'string', 'c': 'float64'}
    df['struct'] = SeriesDict.from_const(base=df, value=struct, name='struct', dtype=dtype)
    assert_equals_data(
        df,
        expected_columns=['_index_skating_order', 'skating_order', 'struct'],
        expected_data=[[1, 1, {'a': 123, 'b': 'test', 'c': 123.456}]]
    )


def test_getitem(engine):

    # TODO: works on bigquery only. Do we want to make this BigQuery only, or fallback to json for pg?
    # Or do more magic in PG to support this partially?

    df = get_df_with_test_data(engine)[['skating_order']]
    df = df.sort_index()[:1].materialize()
    struct = {
        'a': 123,
        'b': 'test',
        'c': 123.456
    }
    dtype={'a': 'int64', 'b': 'string', 'c': 'float64'}
    df['struct'] = SeriesDict.from_const(base=df, value=struct, name='struct', dtype=dtype)
    df['field_a'] = df['struct'].elements['a']
    df['field_b'] = df['struct'].elements['b']
    df['field_c'] = df['struct'].elements['c']
    assert_equals_data(
        df,
        expected_columns=[
            '_index_skating_order', 'skating_order', 'struct', 'field_a', 'field_b', 'field_c'
        ],
        expected_data=[[1, 1, {'a': 123, 'b': 'test', 'c': 123.456}, 123, 'test', 123.456]]
    )