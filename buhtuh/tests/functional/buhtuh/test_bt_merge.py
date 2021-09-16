"""
Copyright 2021 Objectiv B.V.
"""
import pytest

from buhtuh import BuhTuhDataFrame
from tests.functional.buhtuh.test_bt import _get_bt_with_test_data, _get_bt_with_merge_data, \
    assert_equals_data


def test_merge_column_new():
    bt = _get_bt_with_test_data(full_data_set=False)[['skating_order', 'city']]
    mt = _get_bt_with_merge_data()[['skating_order', 'food']]

    result = bt.merge_new(mt, ['skating_order'])

    assert isinstance(result, BuhTuhDataFrame)
    assert_equals_data(
        result,
        # This is weak. Ordering is broken.
        expected_columns=['_index_skating_order', 'skating_order_left', 'skating_order_right', 'city', 'food'],
        expected_data=[
            [1, 1, 1, 'Ljouwert', 'Sûkerbôlle'],
            [2, 2, 2, 'Snits', 'Dúmkes'],
        ]
    )


# OLD STUFF

def test_merge_column():
    bt = _get_bt_with_test_data(full_data_set=False)[['skating_order', 'city']]
    mt = _get_bt_with_merge_data()[['skating_order', 'food']]

    result = bt.merge(mt, ['skating_order'])

    assert isinstance(result, BuhTuhDataFrame)
    assert_equals_data(
        result,
        # This is weak. Ordering is broken.
        expected_columns=['_index_skating_order', 'skating_order_left', 'skating_order_right', 'city', 'food'],
        expected_data=[
            [1, 1, 1, 'Ljouwert', 'Sûkerbôlle'],
            [2, 2, 2, 'Snits', 'Dúmkes'],
        ]
    )


def test_merge_index():
    bt = _get_bt_with_test_data(full_data_set=False)[['skating_order', 'city']]
    mt = _get_bt_with_merge_data()[['skating_order', 'food']]
    result = bt.merge(mt)

    assert isinstance(result, BuhTuhDataFrame)
    assert_equals_data(
        result,
        # This is weak. Ordering is broken.
        expected_columns=['_index_skating_order', 'skating_order_left', 'skating_order_right', 'city', 'food'],
        expected_data=[
            [1, 1, 1, 'Ljouwert', 'Sûkerbôlle'],
            [2, 2, 2, 'Snits', 'Dúmkes'],
        ]
    )


def test_merge_partial_columns():
    bt = _get_bt_with_test_data(full_data_set=False)
    mt = _get_bt_with_merge_data()[['skating_order', 'food']]
    result = bt[['city', 'inhabitants']].merge(mt[['food']])

    assert_equals_data(
        result,
        # This is weak. Ordering is broken.
        expected_columns=['_index_skating_order', 'city', 'inhabitants', 'food'],
        expected_data=[
            [1, 'Ljouwert', 93485, 'Sûkerbôlle'],
            [2, 'Snits', 33520, 'Dúmkes'],
        ]
    )


def test_merge_self():
    bt1 = _get_bt_with_test_data(full_data_set=False)[['city']]
    bt2 = _get_bt_with_test_data(full_data_set=False)[['inhabitants']]
    result = bt1.merge(bt2)
    assert_equals_data(
        result,
        expected_columns=['_index_skating_order', 'city', 'inhabitants'],
        expected_data=[
            [1, 'Ljouwert', 93485],
            [2, 'Snits', 33520],
            [3, 'Drylts', 3055]
        ]
    )


def test_merge_preselection():
    bt = _get_bt_with_test_data(full_data_set=False)[['skating_order', 'city', 'inhabitants']]
    mt = _get_bt_with_merge_data()[['skating_order', 'food']]
    result = bt[bt['skating_order'] != 1].merge(mt[['food']])
    assert_equals_data(
        result,
        # This is weak. Ordering is broken.
        expected_columns=['_index_skating_order', 'skating_order', 'city', 'inhabitants', 'food'],
        expected_data=[
            [2, 2, 'Snits', 33520, 'Dúmkes'],
        ]
    )


def test_merge_expression_columns():
    bt = _get_bt_with_test_data(full_data_set=False)[['skating_order', 'city', 'inhabitants']]
    mt = _get_bt_with_merge_data()[['skating_order', 'food']]
    bt['skating_order'] += 2
    mt['skating_order'] += 2

    result = bt.merge(mt, ['skating_order'])
    assert_equals_data(
        result,
        # This is weak. Ordering is broken.
        expected_columns=['_index_skating_order', 'skating_order_left', 'skating_order_right', 'city', 'inhabitants', 'food'],
        expected_data=[
            [1, 3, 3, 'Ljouwert', 93485, 'Sûkerbôlle'],
            [2, 4, 4, 'Snits', 33520, 'Dúmkes'],
        ]
    )


# This needs a better name
def test_merge_expression_columns_regression():
    bt = _get_bt_with_test_data(full_data_set=False)[['skating_order', 'city', 'inhabitants']]
    mt = _get_bt_with_merge_data()[['skating_order', 'food']]
    bt['x'] = bt['skating_order'] == 3
    bt['y'] = bt['skating_order'] == 3
    bt['z'] = bt['x'] & bt['y']
    result = bt.merge(mt, ['skating_order'])
    assert_equals_data(
        result,
        expected_columns=['_index_skating_order', 'skating_order_left', 'skating_order_right', 'city', 'inhabitants', 'x', 'y',
                          'z', 'food'],
        expected_data=[
            [1, 1, 1, 'Ljouwert', 93485, False, False, False, 'Sûkerbôlle'],
            [2, 2, 2, 'Snits', 33520, False, False, False, 'Dúmkes']
        ]
    )


def test_merge_differently_named_columns():
    bt = _get_bt_with_test_data(full_data_set=False)[['skating_order', 'city']]
    mt = _get_bt_with_merge_data()[['skating_order', 'food']]

    # create a 'skating_order_sum' column to merge on
    agg = mt.groupby('_index_skating_order')[['skating_order']].sum()
    result = bt.merge(agg, [('skating_order', 'skating_order_sum')])
    assert_equals_data(
        result,
        expected_columns=['_index_skating_order', 'skating_order', 'city', 'skating_order_sum'],
        expected_data=[
            [1, 1, 'Ljouwert', 1], [2, 2, 'Snits', 2]
        ]
    )

    with pytest.raises(KeyError):
        # swap left and right columns
        agg = mt.groupby('_index_skating_order')[['skating_order']].sum()
        bt.merge(agg, [('skating_order_sum', 'skating_order')]).head(1)

    # now do the same, but using the series
    agg = mt.groupby('_index_skating_order')[['skating_order']].sum()
    result = bt.merge(agg, [(bt['skating_order'], agg['skating_order_sum'])])
    assert_equals_data(
        result,
        expected_columns=['_index_skating_order', 'skating_order', 'city', 'skating_order_sum'],
        expected_data=[
            [1, 1, 'Ljouwert', 1], [2, 2, 'Snits', 2]
        ]
    )

    with pytest.raises(KeyError):
        # swap left and right columns
        agg = mt.groupby('_index_skating_order')[['skating_order']].sum()
        bt.merge(agg, [(agg['skating_order_sum']), bt['skating_order']]).head(1)

    # now do the same, but using the series with expression
    agg = mt.groupby('_index_skating_order')[['skating_order']].sum()
    result = bt.merge(agg, [(bt['skating_order']+1, agg['skating_order_sum']+1)])
    assert_equals_data(
        result,
        expected_columns=['_index_skating_order', 'skating_order', 'city', 'skating_order_sum'],
        expected_data=[
            [1, 1, 'Ljouwert', 1], [2, 2, 'Snits', 2]
        ]
    )

    # another one, but slightly more cool :)
    result = bt.merge(mt, [(bt['city'].slice(0, 1), mt['food'].slice(0, 1))])[['city', 'food']]
    assert_equals_data(
        result,
        expected_columns=['_index_skating_order', 'city', 'food'],
        expected_data=[
            [3, 'Drylts', 'Dúmkes'], [2, 'Snits', 'Sûkerbôlle']
        ]
    )


def test_merge_left_right():
    bt = _get_bt_with_test_data(full_data_set=False)[['skating_order', 'city']]
    mt = _get_bt_with_merge_data()[['skating_order', 'food']]

    result = bt.merge(mt, how='left')
    assert_equals_data(
        result,
        expected_columns=['_index_skating_order', 'skating_order_left', 'skating_order_right', 'city', 'food'],
        expected_data=[
            [1, 1, 1, 'Ljouwert', 'Sûkerbôlle'], [2, 2, 2, 'Snits', 'Dúmkes'],  [3, 3, None, 'Drylts', None]
        ]
    )

    result = mt.merge(bt, how='right')
    assert_equals_data(
        result,
        expected_columns=['_index_skating_order', 'skating_order_left', 'skating_order_right', 'food', 'city'],
        expected_data=[
            [1, 1, 1, 'Sûkerbôlle', 'Ljouwert'], [2, 2, 2, 'Dúmkes', 'Snits'], [3, None, 3, None, 'Drylts']
        ]
    )