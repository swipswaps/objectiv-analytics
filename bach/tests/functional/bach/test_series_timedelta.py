"""
Copyright 2021 Objectiv B.V.
"""
import datetime

from tests.functional.bach.test_data_and_utils import get_bt_with_food_data, assert_equals_data, \
    get_bt_with_test_data
from tests.functional.bach.test_series_timestamp import types_plus_min


def test_timedelta_arithmetic():
    data = [
        ['d', datetime.date(2020, 3, 11), 'date', ('date', None)],
        ['t', datetime.time(23, 11, 5), 'time', (None, None)],
        ['td', datetime.timedelta(days=321, seconds=9877), 'timedelta', ('timedelta', 'timedelta')],
        ['dt', datetime.datetime(2021, 5, 3, 11, 28, 36, 388000), 'timestamp', ('timestamp', None)]
    ]
    types_plus_min(data, datetime.timedelta(days=123, seconds=5621), 'timedelta')


def test_timedelta_arithmetic2():
    bt = get_bt_with_test_data(full_data_set=True)[['inhabitants']]
    td = datetime.timedelta(days=365, seconds=9877)
    td2 = datetime.timedelta(days=23, seconds=12)

    bt['td'] = td
    bt['td2'] = td2
    expected = [td, td2]
    expected_types = ['timedelta', 'timedelta']

    # special timedelta ops only, rest is tested elsewhere
    bt['mul'] = bt.td * 5
    bt['div'] = bt.td / 5
    expected.extend([td * 5, td / 5])
    expected_types.extend(['timedelta', 'timedelta'])

    assert [s.dtype for s in list(bt.all_series.values())[2:]] == expected_types

    assert_equals_data(
        bt[:1],
        expected_columns=list(bt.all_series.keys()),
        expected_data=[
            [1, 93485, *expected],
        ]
    )

def test_timedelta():
    mt = get_bt_with_food_data()[['skating_order', 'moment']]

    # import code has no means to distinguish between date and timestamp
    gb = mt.groupby([]).aggregate({'moment': ['min', 'max']})
    gb['delta'] = gb['moment_max'] - gb['moment_min']

    assert_equals_data(
        gb,
        expected_columns=['moment_min', 'moment_max', 'delta'],
        expected_data=[
            [datetime.datetime(2021, 5, 3, 11, 28, 36, 388000), datetime.datetime(2022, 5, 3, 14, 13, 13, 388000), datetime.timedelta(days=365, seconds=9877)]
        ]
    )

    r2 = gb[['delta']].groupby().mean()
    assert_equals_data(
        r2,
        expected_columns=['delta_mean'],
        expected_data=[
            [datetime.timedelta(days=365, seconds=9877)]
        ]
    )

    r3 = r2['delta_mean'] + datetime.timedelta()
    assert_equals_data(
        r3,
        expected_columns=['delta_mean'],
        expected_data=[
            [datetime.timedelta(days=365, seconds=9877)]
        ]
    )
