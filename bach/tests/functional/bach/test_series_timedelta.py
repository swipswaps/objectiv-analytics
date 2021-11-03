"""
Copyright 2021 Objectiv B.V.
"""
import datetime

from tests.functional.bach.test_data_and_utils import get_bt_with_food_data, assert_equals_data, \
    get_bt_with_test_data


def test_timedelta_arithmetic():
    bt = get_bt_with_test_data(full_data_set=True)[['inhabitants']]

    td = datetime.timedelta(days=365, seconds=9877)
    td2 = datetime.timedelta(days=23, seconds=12)
    dt = datetime.datetime(2021, 5, 3, 11, 28, 36, 388000)
    t = datetime.time(23, 11, 5)
    d = datetime.date(2020, 3, 11)

    bt['td'] = td
    bt['td2'] = td2
    bt['dt'] = dt
    bt['t'] = t
    bt['d'] = d
    expected = [td, td2, dt, t, d]
    expected_types = ['timedelta', 'timedelta', 'timestamp', 'time', 'date']

    # basis td only ops
    bt['plus'] = bt.td + bt.td2
    bt['min'] = bt.td - bt.td2
    bt['mul'] = bt.td * 5
    bt['div'] = bt.td / 5
    expected.extend([td + td2, td - td2, td * 5, td / 5])
    expected_types.extend(['timedelta', 'timedelta', 'timedelta', 'timedelta'])

    bt['plus_dt'] = bt.td + bt.dt
    bt['plus_td'] = bt.td + bt.td
    bt['plus_d'] = bt.td + bt.d
    bt['plus_t'] = bt.td + bt.t
    #     bt['min_t'] = bt.td - bt.t  # Not supported by python datetime
    expected.extend([td + dt,  td + td, td + d, datetime.time(1, 55, 42)])
    expected_types.extend(['timestamp', 'timedelta', 'date', 'time'])

    bt['min_td'] = bt.td - bt.td
    bt['min_t'] = bt.td - bt.t  # Not supported by python datetime
    expected.extend([td - td, datetime.timedelta(days=364, seconds=12812)])
    expected_types.extend(['timedelta', 'timedelta'])

    assert [s.dtype for s in list(bt.all_series.values())[2:]] == expected_types

    assert_equals_data(
        bt[:1],
        expected_columns=list(bt.all_series.keys()),
        expected_data=[
            [1, 93485, *expected],
        ]
    )

    # bt['floordiv1'] = bt.a // bt.b
    # bt['pow'] = bt.a ** bt.b
    # bt['mod'] = bt.b % bt.a

def test_timedelta():
    mt = get_bt_with_food_data()[['skating_order', 'moment']]

    # import code has no means to distinguish between date and timestamp
    gb = mt.groupby([]).aggregate({'moment': ['min', 'max']})
    gb['delta'] = gb['moment_max'] - gb['moment_min']

    assert_equals_data(
        gb,
        expected_columns=['index', 'moment_min', 'moment_max', 'delta'],
        expected_data=[
            [1, datetime.datetime(2021, 5, 3, 11, 28, 36, 388000), datetime.datetime(2022, 5, 3, 14, 13, 13, 388000), datetime.timedelta(days=365, seconds=9877)]
        ]
    )

    r2 = gb[['delta']].groupby().mean()
    assert_equals_data(
        r2,
        expected_columns=['index', 'delta_mean'],
        expected_data=[
            [1, datetime.timedelta(days=365, seconds=9877)]
        ]
    )

    r3 = r2['delta_mean'] + datetime.timedelta()
    assert_equals_data(
        r3,
        expected_columns=['index', 'delta_mean'],
        expected_data=[
            [1, datetime.timedelta(days=365, seconds=9877)]
        ]
    )
