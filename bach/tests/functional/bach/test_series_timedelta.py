"""
Copyright 2021 Objectiv B.V.
"""
import datetime

import numpy as np
import pandas as pd

from tests.functional.bach.test_data_and_utils import get_bt_with_food_data, assert_equals_data, \
    get_bt_with_test_data, get_from_df
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


def test_to_pandas():
    bt = get_bt_with_test_data()
    bt['td'] = datetime.timedelta(days=321, seconds=9877)
    bt[['td']].to_pandas()
    # TODO, this is not great, but at least it does not error when imported into pandas,
    # and it looks good over there
    assert bt[['td']].to_numpy()[0] == [27744277000000000]


def test_timedelta_operations():
    pdf = pd.DataFrame(
        data={
            'start_date': [
                np.datetime64("2022-01-01"),
                np.datetime64("2022-01-05"),
                np.datetime64("2022-01-10"),
            ],
            'end_date': [
                np.datetime64("2022-01-03"),
                np.datetime64("2022-01-06"),
                np.datetime64("2022-01-10"),
            ]
        }
    )
    df = get_from_df('test_datetime_df', pdf)

    pdf['diff'] = pdf['end_date'] - pdf['start_date']
    df['diff'] = df['end_date'] - df['start_date']
    df['diff'].dt.days
    result = df.diff.quantile(q=[0.25, 0.5, .75])
    print('hola')