"""
Copyright 2021 Objectiv B.V.
"""
import datetime

import pytest

from tests.functional.bach.test_data_and_utils import assert_equals_data, get_bt_with_food_data, \
    get_bt_with_test_data


def test_timestamp_data():
    mt = get_bt_with_food_data()[['moment']]
    from datetime import datetime
    assert_equals_data(
        mt,
        expected_columns=['_index_skating_order', 'moment'],
        expected_data=[
            [1, datetime(2021, 5, 3, 11, 28, 36, 388000)],
            [2, datetime(2021, 5, 4, 23, 28, 36, 388000)],
            [4, datetime(2022, 5, 3, 14, 13, 13, 388000)]
        ]
    )


@pytest.mark.parametrize("asstring", [True, False])
def test_timestamp_comparator(asstring: bool):
    mt = get_bt_with_food_data()[['moment']]
    from datetime import datetime
    dt = datetime(2021, 5, 3, 11, 28, 36, 388000)

    if asstring:
        dt = str(dt)

    result = mt[mt['moment'] == dt]
    assert_equals_data(
        result,
        expected_columns=['_index_skating_order', 'moment'],
        expected_data=[
            [1, datetime(2021, 5, 3, 11, 28, 36, 388000)]
        ]
    )

    assert_equals_data(
        mt[mt['moment'] >= dt],
        expected_columns=['_index_skating_order', 'moment'],
        expected_data=[
            [1, datetime(2021, 5, 3, 11, 28, 36, 388000)],
            [2, datetime(2021, 5, 4, 23, 28, 36, 388000)],
            [4, datetime(2022, 5, 3, 14, 13, 13, 388000)]
        ]
    )

    assert_equals_data(
        mt[mt['moment'] > dt],
        expected_columns=['_index_skating_order', 'moment'],
        expected_data=[
            [2, datetime(2021, 5, 4, 23, 28, 36, 388000)],
            [4, datetime(2022, 5, 3, 14, 13, 13, 388000)]
        ]
    )

    dt = datetime(2022, 5, 3, 14, 13, 13, 388000)
    if asstring:
        dt = str(dt)

    assert_equals_data(
        mt[mt['moment'] <= dt],
        expected_columns=['_index_skating_order', 'moment'],
        expected_data=[
            [1, datetime(2021, 5, 3, 11, 28, 36, 388000)],
            [2, datetime(2021, 5, 4, 23, 28, 36, 388000)],
            [4, datetime(2022, 5, 3, 14, 13, 13, 388000)]
        ]
    )

    assert_equals_data(
        mt[mt['moment'] < dt],
        expected_columns=['_index_skating_order', 'moment'],
        expected_data=[
            [1, datetime(2021, 5, 3, 11, 28, 36, 388000)],
            [2, datetime(2021, 5, 4, 23, 28, 36, 388000)]
        ]
    )


def test_timestamp_arithmetic():
    bt = get_bt_with_test_data(full_data_set=True)[['inhabitants']]

    td = datetime.timedelta(days=321, seconds=9877)
    dt = datetime.datetime(2021, 5, 3, 11, 28, 36, 388000)
    t = datetime.time(23, 11, 5)
    d = datetime.date(2020, 3, 11)

    bt['td'] = td
    bt['dt'] = dt
    bt['t'] = t
    bt['d'] = d

    expected = [td, dt, t, d]
    expected_types = ['timedelta', 'timestamp', 'time', 'date']

    bt['plus_td'] = bt.dt + bt.td
    expected.extend([dt + td])
    expected_types.extend(['timestamp'])

    bt['min_d'] = bt.dt - bt.d  # not supported by python
    bt['min_t'] = bt.dt - bt.t  # not supported by python
    bt['min_td'] = bt.dt - bt.td
    bt['min_dt'] = bt.dt - bt.dt
    expected.extend([datetime.timedelta(days=418, seconds=41316, microseconds=388000),
                     datetime.datetime(2021, 5, 2, 12, 17, 31, 388000), dt-td, dt-dt])
    expected_types.extend(['timedelta', 'timestamp', 'timestamp', 'timedelta'])

    assert [s.dtype for s in list(bt.all_series.values())[2:]] == expected_types

    assert_equals_data(
        bt[:1],
        expected_columns=list(bt.all_series.keys()),
        expected_data=[
            [1, 93485, *expected],
        ]
    )