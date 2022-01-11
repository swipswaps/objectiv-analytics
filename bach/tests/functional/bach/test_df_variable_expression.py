"""
Copyright 2021 Objectiv B.V.
"""
import pytest

from bach.dataframe import DtypeValuePair
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data, \
    get_bt_with_food_data


def test_variable_happy_path():
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
    df, suffix = df.create_variable(name='suffix', value=' city')
    df, filter_value = df.create_variable(name='filter_value', value=2400)
    df['founding'] = df.founding + add_value
    df['city'] = df['city'] + suffix
    df = df[df.founding < filter_value]

    assert df.variables == {
        'add_value': DtypeValuePair(dtype='int64', value=1000),
        'suffix': DtypeValuePair(dtype='string', value=' city'),
        'filter_value': DtypeValuePair(dtype='int64', value=2400)
    }
    assert_equals_data(
        df,
        expected_columns=['_index_skating_order', 'city', 'founding'],
        expected_data=[
            [1, 'Ljouwert city', 2285],
            [3, 'Drylts city', 2268],
        ]
    )

    df = df.set_variable('add_value', 2000)
    df = df.set_variable('filter_value', 4400)
    assert df.variables == {
        'add_value': DtypeValuePair(dtype='int64', value=2000),
        'suffix': DtypeValuePair(dtype='string', value=' city'),
        'filter_value': DtypeValuePair(dtype='int64', value=4400)
    }
    assert_equals_data(
        df,
        expected_columns=['_index_skating_order', 'city', 'founding'],
        expected_data=[
            [1, 'Ljouwert city', 3285],
            [2, 'Snits city', 3456],
            [3, 'Drylts city', 3268],
        ]
    )

    df = df.materialize()
    df = df.set_variable('add_value', 3000)
    df = df.set_variable('suffix', ' sted')
    assert df.variables == {
        'add_value': DtypeValuePair(dtype='int64', value=3000),
        'suffix': DtypeValuePair(dtype='string', value=' sted'),
        'filter_value': DtypeValuePair(dtype='int64', value=4400)
    }
    assert_equals_data(
        df,
        expected_columns=['_index_skating_order', 'city', 'founding'],
        expected_data=[
            [1, 'Ljouwert sted', 4285],
            [3, 'Drylts sted', 4268],
        ]
    )


def test_variable_wrong_type():
    df = get_bt_with_test_data()[['city', 'founding']]
    df, int_variable = df.create_variable('int_variable', 1000)
    assert df.variables == {'int_variable': DtypeValuePair(dtype='int64', value=1000)}

    with pytest.raises(ValueError, match='Cannot change dtype'):
        df = df.set_variable('int_variable', 'string value')
    # assert variables are unchanged
    assert df.variables == {'int_variable': DtypeValuePair(dtype='int64', value=1000)}
    # should still work
    df.to_pandas()


def test_merge_happy_path():
    bt = get_bt_with_test_data(full_data_set=False)[['skating_order', 'city']]
    mt = get_bt_with_food_data()[['skating_order', 'food']]

    bt, shared = bt.create_variable(name='shared', value=' first')
    bt, variable1 = bt.create_variable(name='variable1', value=' city')
    bt['city'] = bt['city'] + variable1 + shared
    mt, shared = mt.create_variable(name='shared', value=' second')
    mt, variable2 = mt.create_variable(name='variable2', value=' food')
    mt['food'] = mt['food'] + variable2 + shared

    assert bt.variables == {
        'shared': DtypeValuePair(dtype='string', value=' first'),
        'variable1': DtypeValuePair(dtype='string', value=' city')
    }
    assert mt.variables == {
        'shared': DtypeValuePair(dtype='string', value=' second'),
        'variable2': DtypeValuePair(dtype='string', value=' food')
    }

    result = bt.merge(mt)
    # The 'shared' variable is in both DataFrames. The value from the left df will override the right
    assert result.variables == {
        'shared': DtypeValuePair(dtype='string', value=' first'),
        'variable1': DtypeValuePair(dtype='string', value=' city'),
        'variable2': DtypeValuePair(dtype='string', value=' food')
    }

    assert_equals_data(
        result,
        expected_columns=[
            '_index_skating_order_x',
            '_index_skating_order_y',
            'skating_order',
            'city',
            'food'
        ],
        expected_data=[
            [1, 1, 1, 'Ljouwert city first', 'Sûkerbôlle food first'],
            [2, 2, 2, 'Snits city first', 'Dúmkes food first'],
        ]
    )


def test_merge_variable_clash():
    bt = get_bt_with_test_data(full_data_set=False)[['skating_order', 'inhabitants']]
    mt = get_bt_with_food_data()[['skating_order', 'food']]
    bt, bt_variable = bt.create_variable(name='shared', value=1234)
    bt['inhabitants'] = bt['inhabitants'] + bt_variable
    mt, mt_variable = mt.create_variable(name='shared', value='string value')
    mt['food'] = mt['food'] + mt_variable

    with pytest.raises(ValueError, match='Incompatible variables. Dtype does not match'):
        bt.merge(mt)
