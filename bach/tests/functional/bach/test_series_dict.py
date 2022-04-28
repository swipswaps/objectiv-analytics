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
        'b': 456
    }
    dtype={'a': 'int64', 'b': 'int64'}
    df['struct_ints'] = SeriesDict.from_const(base=df, value=struct, name='struct_ints', dtype=dtype)
    assert_equals_data(
        df,
        expected_columns=['_index_skating_order', 'skating_order', 'struct_ints'],
        expected_data=[[1, 1, {'a': 123, 'b': 456}]]
    )
