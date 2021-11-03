"""
Copyright 2021 Objectiv B.V.
"""
import datetime

from tests.functional.bach.test_data_and_utils import assert_equals_data, get_bt_with_test_data


def test_time_arithmetic():
    bt = get_bt_with_test_data(full_data_set=True)[['inhabitants']]

    td = datetime.timedelta(days=365, seconds=9877)
    dt = datetime.datetime(2021, 5, 3, 11, 28, 36, 388000)
    t = datetime.time(23, 11, 5)
    d = datetime.date(2020, 3, 11)

    bt['td'] = td
    bt['dt'] = dt
    bt['t'] = t
    bt['d'] = d
    expected = [td, dt, t, d]
    expected_types = ['timedelta', 'timestamp', 'time', 'date']

    bt['plus_dt'] = bt.t + bt.dt  # not supported by python datetime
    bt['plus_td'] = bt.t + bt.td  # not supported by python datetime
    bt['plus_d'] = bt.t + bt.d    # not supported by python datetime
    expected.extend([datetime.datetime(2021, 5, 4, 10, 39, 41, 388000),
                     datetime.time(1, 55, 42),
                     datetime.datetime(2020, 3, 11, 23, 11, 5)])
    expected_types.extend(['timestamp', 'time', 'timestamp'])

    bt['min_t'] = bt.t - bt.t
    bt['min_td'] = bt.t - bt.td
    expected.extend([datetime.timedelta(0), datetime.time(20, 26, 28)])
    expected_types.extend(['timestamp', 'time'])

    assert [s.dtype for s in list(bt.all_series.values())[2:]] == expected_types

    assert_equals_data(
        bt[:1],
        expected_columns=list(bt.all_series.keys()),
        expected_data=[
            [1, 93485, *expected],
        ]
    )