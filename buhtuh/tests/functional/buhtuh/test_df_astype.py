"""
Copyright 2021 Objectiv B.V.
"""
import numpy

from tests.functional.buhtuh.test_data_and_utils import get_bt_with_test_data, assert_equals_data


def test_astype_dtypes():
    # case 1: cast all columns to a type
    bt = get_bt_with_test_data()
    bt_int = bt[['inhabitants', 'founding']]
    bt_float = bt_int.astype('float64')
    assert bt_int.dtypes == {'founding': 'int64', 'inhabitants': 'int64'}
    assert bt_float.dtypes == {'founding': 'float64', 'inhabitants': 'float64'}

    # case 2: cast specific columns to a type
    # pre-test check
    assert bt.dtypes == {
        'city': 'string',
        'founding': 'int64',
        'inhabitants': 'int64',
        'municipality': 'string',
        'skating_order': 'int64'
    }
    # 2.1: no columns specified
    bt_none_changed = bt.astype({})
    assert bt_none_changed.dtypes == bt.dtypes
    # 2.1: one column specified
    bt_astype1 = bt.astype({
        'inhabitants': 'float64'
    })
    assert bt_astype1.dtypes == {
        'city': 'string',
        'founding': 'int64',
        'inhabitants': 'float64',   # changed
        'municipality': 'string',
        'skating_order': 'int64'
    }

    # 2.2: Multiple columns specified
    bt_astype2 = bt.astype({
        'founding': 'float64',
        'inhabitants': 'string',
        'city': 'string',  # not changed,
        'skating_order': 'string'
    })
    assert bt_astype2.dtypes == {
        'city': 'string',
        'founding': 'float64',
        'inhabitants': 'string',
        'municipality': 'string',
        'skating_order': 'string'
    }
    assert bt.data['city'] is bt_astype2.data['city']
    assert bt.data['founding'] is not bt_astype2.data['founding']
    assert bt.data['inhabitants'] is not bt_astype2.data['inhabitants']
    assert bt.data['municipality'] is bt_astype2.data['municipality']
    assert bt.data['skating_order'] is not bt_astype2.data['skating_order']


def test_astype_to_int():
    bt = get_bt_with_test_data()
    bt = bt[['inhabitants']]
    bt['inhabitants'] = bt['inhabitants'] / 1000
    bt_int = bt.astype('int64')
    assert bt.dtypes == {'inhabitants': 'float64'}
    assert bt_int.dtypes == {'inhabitants': 'int64'}
    assert_equals_data(
        bt,
        expected_columns=['_index_skating_order', 'inhabitants'],
        expected_data=[
            [1, 93.485],
            [2, 33.520],
            [3, 3.055]
        ]
    )
    # When converted to ints, data will be rounded to nearest integer.
    assert_equals_data(
        bt_int,
        expected_columns=['_index_skating_order', 'inhabitants'],
        expected_data=[
            [1, 93],
            [2, 34],
            [3, 3]
        ]
    )


def test_astype_dtype_aliases():
    bt = get_bt_with_test_data()
    bt = bt[['inhabitants']]
    # Using an alias of 'int64' in the call to `astype()` should result in the same DataFrame
    bt_int0 = bt.astype('int64')
    bt_int1 = bt.astype('bigint')
    bt_int2 = bt.astype(int)
    bt_int3 = bt.astype(numpy.int64)
    assert bt_int0 == bt_int1
    assert bt_int0 == bt_int2
    assert bt_int0 == bt_int3
