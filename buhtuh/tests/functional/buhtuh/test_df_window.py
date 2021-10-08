import pytest

import buhtuh
from tests.functional.buhtuh.test_data_and_utils import assert_equals_data, get_bt_with_test_data


def test_windowing_windows():
    ## Just test that different windows don't generate SQL errors. Logic will be checked in different tests.
    bt = get_bt_with_test_data(full_data_set=True)

    # no sorting, no partition
    p0 = bt.window()

    # no sorting, simple partition
    p1 = bt.window('municipality')

    # no sorting, multi field partition
    p2 = bt.window(['municipality', 'city'])

    # no sorting, expression partition
    p3 = bt.window(['municipality', bt['inhabitants'] < 10000])

    for w in [p0,p1,p2,p3]:
        bt.inhabitants.window_first_value(w).head()


def test_windowing_functions_agg():
    bt = get_bt_with_test_data(full_data_set=True)
    window = bt.sort_values('inhabitants').window('municipality')
    bt['min'] = bt.inhabitants.min(window)
    bt['max'] = bt.inhabitants.max(window)
    bt['count'] = bt.inhabitants.count(window)

    with pytest.raises(Exception):
        # Not supported in window functions.
        bt['nunique'] = bt.inhabitants.nunique(window)

    assert_equals_data(
        bt,
        order_by='inhabitants',
        expected_columns=[
            '_index_skating_order', 'skating_order', 'city', 'municipality', 'inhabitants',
            'founding', 'min', 'max', 'count'
        ], expected_data=[
            [4, 4, 'Sleat', 'De Friese Meren', 700, 1426, 700, 700, 1],
            [6, 6, 'Hylpen', 'Súdwest-Fryslân', 870, 1225, 870, 870, 1],
            [5, 5, 'Starum', 'Súdwest-Fryslân', 960, 1061, 870, 960, 2],
            [3, 3, 'Drylts', 'Súdwest-Fryslân', 3055, 1268, 870, 3055, 3],
            [7, 7, 'Warkum', 'Súdwest-Fryslân', 4440, 1399, 870, 4440, 4],
            [8, 8, 'Boalsert', 'Súdwest-Fryslân', 10120, 1455, 870, 10120, 5],
            [11, 11, 'Dokkum', 'Noardeast-Fryslân', 12675, 1298, 12675, 12675, 1],
            [10, 10, 'Frjentsjer', 'Waadhoeke', 12760, 1374, 12760, 12760, 1],
            [9, 9, 'Harns', 'Harlingen', 14740, 1234, 14740, 14740, 1],
            [2, 2, 'Snits', 'Súdwest-Fryslân', 33520, 1456, 870, 33520, 6],
            [1, 1, 'Ljouwert', 'Leeuwarden', 93485, 1285, 93485, 93485, 1]
        ]
    )



def test_windowing_functions_basics():
    # just check the results in too many ways
    bt = get_bt_with_test_data(full_data_set=True)
    window = bt.sort_values('inhabitants').window('municipality')
    bt['row_number'] = bt.inhabitants.window_row_number(window)
    bt['rank'] = bt.inhabitants.window_rank(window)
    bt['dense_rank'] = bt.inhabitants.window_dense_rank(window)
    bt['percent_rank'] = bt.inhabitants.window_percent_rank(window)
    bt['cume_dist'] = bt.inhabitants.window_cume_dist(window)
    bt['ntile'] = bt.inhabitants.window_ntile(window, 3)
    bt['lag'] = bt.inhabitants.window_lag(window, 2, 9999)
    bt['lead'] = bt.inhabitants.window_lead(window, 2, 9999)
    bt['first_value'] = bt.inhabitants.window_first_value(window)
    bt['last_value'] = bt.inhabitants.window_last_value(window)
    bt['nth_value'] = bt.inhabitants.window_nth_value(window, 2)


    assert_equals_data(
        bt,
        order_by='inhabitants',
        expected_columns=[
            '_index_skating_order', 'skating_order', 'city', 'municipality', 'inhabitants',
            'founding', 'row_number', 'rank', 'dense_rank', 'percent_rank', 'cume_dist', 'ntile', 'lag', 'lead',
            'first_value', 'last_value', 'nth_value'
        ], expected_data=[
            [4, 4, 'Sleat', 'De Friese Meren', 700, 1426, 1, 1, 1, 0.0, 1.0, 1, 9999, 9999, 700, 700, None],
            [6, 6, 'Hylpen', 'Súdwest-Fryslân', 870, 1225, 1, 1, 1, 0.0, 0.16666666666666666, 1, 9999, 3055, 870, 870, None],
            [5, 5, 'Starum', 'Súdwest-Fryslân', 960, 1061, 2, 2, 2, 0.2, 0.3333333333333333, 1, 9999, 4440, 870, 960, 960],
            [3, 3, 'Drylts', 'Súdwest-Fryslân', 3055, 1268, 3, 3, 3, 0.4, 0.5, 2, 870, 10120, 870, 3055, 960],
            [7, 7, 'Warkum', 'Súdwest-Fryslân', 4440, 1399, 4, 4, 4, 0.6, 0.6666666666666666, 2, 960, 33520, 870, 4440, 960],
            [8, 8, 'Boalsert', 'Súdwest-Fryslân', 10120, 1455, 5, 5, 5, 0.8, 0.8333333333333334, 3, 3055, 9999, 870, 10120, 960],
            [11, 11, 'Dokkum', 'Noardeast-Fryslân', 12675, 1298, 1, 1, 1, 0.0, 1.0, 1, 9999, 9999, 12675, 12675, None],
            [10, 10, 'Frjentsjer', 'Waadhoeke', 12760, 1374, 1, 1, 1, 0.0, 1.0, 1, 9999, 9999, 12760, 12760, None],
            [9, 9, 'Harns', 'Harlingen', 14740, 1234, 1, 1, 1, 0.0, 1.0, 1, 9999, 9999, 14740, 14740, None],
            [2, 2, 'Snits', 'Súdwest-Fryslân', 33520, 1456, 6, 6, 6, 1.0, 1.0, 3, 4440, 9999, 870, 33520, 960],
            [1, 1, 'Ljouwert', 'Leeuwarden', 93485, 1285, 1, 1, 1, 0.0, 1.0, 1, 9999, 9999, 93485, 93485, None]
        ]
    )

def test_windowing_basics_lag():
    bt = get_bt_with_test_data(full_data_set=True)
    bt['lag'] = bt.inhabitants.window_lag(bt.sort_values('inhabitants').window())
    bt['lag2'] = bt.inhabitants.window_lag(bt.sort_values('inhabitants').window('municipality'), 2, 9999)
    bt['lag_muni'] = bt.inhabitants.window_lag(bt.sort_values('inhabitants').window('municipality'))

    assert_equals_data(
        bt[['municipality','inhabitants', 'lag', 'lag2', 'lag_muni']],
        order_by='inhabitants',
        expected_columns=['_index_skating_order', 'municipality', 'inhabitants', 'lag', 'lag2', 'lag_muni'],
        expected_data=[
            [4, 'De Friese Meren', 700, None, 9999, None], [6, 'Súdwest-Fryslân', 870, 700, 9999, None],
            [5, 'Súdwest-Fryslân', 960, 870, 9999, 870], [3, 'Súdwest-Fryslân', 3055, 960, 870, 960],
            [7, 'Súdwest-Fryslân', 4440, 3055, 960, 3055], [8, 'Súdwest-Fryslân', 10120, 4440, 3055, 4440],
            [11, 'Noardeast-Fryslân', 12675, 10120, 9999, None], [10, 'Waadhoeke', 12760, 12675, 9999, None],
            [9, 'Harlingen', 14740, 12760, 9999, None], [2, 'Súdwest-Fryslân', 33520, 14740, 4440, 10120],
            [1, 'Leeuwarden', 93485, 33520, 9999, None]
        ]
    )


def test_windowing_expressions():
    bt = get_bt_with_test_data(full_data_set=False)
    bt['lag'] = bt.inhabitants.window_lag(bt.sort_values('inhabitants').window())
    bt['test'] = bt['lag'] == 3055

    assert_equals_data(
        bt[['municipality','inhabitants', 'lag', 'test']],
        order_by='inhabitants',
        expected_columns=['_index_skating_order', 'municipality', 'inhabitants', 'lag', 'test'],
        expected_data=[
            [3, 'Súdwest-Fryslân', 3055, None, None], [2, 'Súdwest-Fryslân', 33520, 3055, True],
            [1, 'Leeuwarden', 93485, 33520, False]
        ]
    )


