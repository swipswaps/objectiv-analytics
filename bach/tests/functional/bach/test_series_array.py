"""
Copyright 2022 Objectiv B.V.
"""
from bach.series import SeriesArray
from tests.functional.bach.test_data_and_utils import get_df_with_test_data, assert_equals_data


def test_basic_value_to_expression(engine):
    df = get_df_with_test_data(engine)[['skating_order']]
    df = df.sort_index()[:1].materialize()
    df['int_array'] = SeriesArray.from_value(base=df, value=[1, 2, 3], name='int_array', dtype=['int64'])
    df['str_array'] = SeriesArray.from_value(base=df, value=['a', 'b', 'c'], name='str_array', dtype=['string'])
    print(df.dtypes)
    assert_equals_data(
        df,
        expected_columns=['_index_skating_order', 'skating_order', 'int_array', 'str_array'],
        expected_data=[[1, 1, [1, 2, 3], ['a', 'b', 'c']]]
    )


def test_series_to_array(engine):
    df = get_df_with_test_data(engine)[['skating_order']]
    df['int_array'] = SeriesArray.from_value(
        base=df,
        value=[
            df.skating_order,
            df.skating_order * 2,
            df.skating_order * 3],
        name='int_array',
        dtype=['int64']
    )
    df['str_array'] = SeriesArray.from_value(
        base=df,
        value=['a', 'b', 'c'],
        name='str_array',
        dtype=['string']
    )
    print(df.dtypes)
    assert_equals_data(
        df,
        expected_columns=['_index_skating_order', 'skating_order', 'int_array', 'str_array'],
        expected_data=[
            [1, 1, [1, 2, 3], ['a', 'b', 'c']],
            [2, 2, [2, 4, 6], ['a', 'b', 'c']],
            [3, 3, [3, 6, 9], ['a', 'b', 'c']]
        ]
    )





def test_getitem(engine):
    df = get_df_with_test_data(engine)[['skating_order']]
    df = df.sort_index()[:1].materialize()
    df['int_array'] = SeriesArray.from_value(base=df, value=[1, 2, 3], name='int_array', dtype=['int64'])
    df['str_array'] = SeriesArray.from_value(base=df, value=['a', 'b', 'c'], name='str_array', dtype=['string'])
    df = df.materialize()   # TODO: make tests pass without this materialize() call
    df['a'] = df['int_array'].arr[0]
    df['b'] = df['int_array'].arr[1]
    df['c'] = df['int_array'].arr[2]
    df['d'] = df['str_array'].arr[1]
    assert_equals_data(
        df,
        expected_columns=[
            '_index_skating_order', 'skating_order', 'int_array', 'str_array', 'a', 'b', 'c', 'd'
        ],
        expected_data=[[1, 1, [1, 2, 3], ['a', 'b', 'c'], 1, 2, 3, 'b']]
    )
    assert df.dtypes['a'] == 'int64'
    assert df.dtypes['b'] == 'int64'
    assert df.dtypes['c'] == 'int64'
    assert df.dtypes['d'] == 'string'


def test_len(engine):
    df = get_df_with_test_data(engine)[['skating_order']]
    df = df.sort_index()[:1].materialize()
    df['empty_array'] = SeriesArray.from_value(base=df, value=[], name='empty_array', dtype=['int64'])
    df['int_array'] = SeriesArray.from_value(base=df, value=[1, 2, 3, 4, 5, 6], name='int_array', dtype=['int64'])
    df['str_array'] = SeriesArray.from_value(base=df, value=['a', 'b', 'c'], name='str_array', dtype=['string'])
    df = df.materialize()   # TODO: make tests pass without this materialize() call
    df['a'] = df['empty_array'].arr.len()
    df['b'] = df['int_array'].arr.len()
    df['c'] = df['str_array'].arr.len()
    print(df.dtypes)
    assert_equals_data(
        df,
        expected_columns=[
            '_index_skating_order', 'skating_order', 'empty_array', 'int_array', 'str_array', 'a', 'b', 'c'
        ],
        expected_data=[
            [1, 1, [], [1, 2, 3, 4, 5, 6], ['a', 'b', 'c'], 0, 6, 3]
        ]
    )
