"""
Copyright 2021 Objectiv B.V.
"""
from bach.dataframe import DtypeValuePair
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data


def test_basic():
    df = get_bt_with_test_data()[['city', 'founding']]
    assert_equals_data(
        df,
        expected_columns=['_index_skating_order', 'city', 'founding'],
        expected_data=[
            [1, 'Ljouwert', 1285],
            [2, 'Snits', 1456],
            [3, 'Drylts', 1268],
        ]
    )

    df, add_value = df.create_variable(name='add_value', value=1000)
    df, filter_value = df.create_variable(name='filter_value', value=2400)
    df['founding'] = df.founding + add_value
    df = df[df.founding < filter_value]

    assert df.variables == {
        'add_value': DtypeValuePair(dtype='int64', value=1000),
        'filter_value': DtypeValuePair(dtype='int64', value=2400)
    }
    assert_equals_data(
        df,
        expected_columns=['_index_skating_order', 'city', 'founding'],
        expected_data=[
            [1, 'Ljouwert', 2285],
            [3, 'Drylts', 2268],
        ]
    )

    df = df.set_variable('add_value', 2000)
    df = df.set_variable('filter_value', 4400)
    assert df.variables == {
        'add_value': DtypeValuePair(dtype='int64', value=2000),
        'filter_value': DtypeValuePair(dtype='int64', value=4400)
    }
    assert_equals_data(
        df,
        expected_columns=['_index_skating_order', 'city', 'founding'],
        expected_data=[
            [1, 'Ljouwert', 3285],
            [2, 'Snits', 3456],
            [3, 'Drylts', 3268],
        ]
    )

    df = df.materialize()
    df = df.set_variable('add_value', 3000)
    assert df.variables == {
        'add_value': DtypeValuePair(dtype='int64', value=3000),
        'filter_value': DtypeValuePair(dtype='int64', value=4400)
    }
    assert_equals_data(
        df,
        expected_columns=['_index_skating_order', 'city', 'founding'],
        expected_data=[
            [1, 'Ljouwert', 4285],
            [3, 'Drylts', 4268],
        ]
    )
