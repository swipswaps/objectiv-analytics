"""
Copyright 2021 Objectiv B.V.
"""
import datetime

import pytest

from bach import SeriesDate
from tests.functional.bach.test_data_and_utils import assert_equals_data, get_bt_with_food_data, \
    assert_db_type, get_bt_with_test_data


@pytest.mark.parametrize("asstring", [True, False])
def test_date_comparator(asstring: bool):
    mt = get_bt_with_food_data()[['date']]

    # import code has no means to distinguish between date and timestamp
    mt['date'] = mt['date'].astype('date')

    assert_db_type(mt['date'], 'date', SeriesDate)

    from datetime import date
    dt = date(2021, 5, 3)

    if asstring:
        dt = str(dt)

    result = mt[mt['date'] == dt]
    assert_equals_data(
        result,
        expected_columns=['_index_skating_order', 'date'],
        expected_data=[
            [1, date(2021, 5, 3)]
        ]
    )
    assert_equals_data(
        mt[mt['date'] >= dt],
        expected_columns=['_index_skating_order', 'date'],
        expected_data=[
            [1, date(2021, 5, 3)],
            [2, date(2021, 5, 4)],
            [4, date(2022, 5, 3)]
        ]
    )

    assert_equals_data(
        mt[mt['date'] > dt],
        expected_columns=['_index_skating_order', 'date'],
        expected_data=[
            [2, date(2021, 5, 4)],
            [4, date(2022, 5, 3)]
        ]
    )

    dt = date(2022, 5, 3)
    if asstring:
        dt = str(dt)

    assert_equals_data(
        mt[mt['date'] <= dt],
        expected_columns=['_index_skating_order', 'date'],
        expected_data=[
            [1, date(2021, 5, 3)],
            [2, date(2021, 5, 4,)],
            [4, date(2022, 5, 3)]
        ]
    )

    assert_equals_data(
        mt[mt['date'] < dt],
        expected_columns=['_index_skating_order', 'date'],
        expected_data=[
            [1, date(2021, 5, 3)],
            [2, date(2021, 5, 4)]
        ]
    )


def test_date_format():
    mt = get_bt_with_food_data()[['moment', 'date']]

    mt['date'] = mt['date'].astype('date')

    assert mt['moment'].dtype == 'timestamp'
    assert mt['date'].dtype == 'date'

    assert mt['moment'].format('YYYY').dtype == 'string'

    mt['fyyyy'] = mt['moment'].format('YYYY')
    mt['fday'] = mt['date'].format('Day')

    assert_equals_data(
        mt[['fyyyy', 'fday']],
        expected_columns=['_index_skating_order', 'fyyyy', 'fday'],
        expected_data=[
            [1, '2021', 'Monday   '],
            [2, '2021', 'Tuesday  '],
            [4, '2022', 'Tuesday  ']
        ]
    )


def test_date_arithmetic():
    bt = get_bt_with_test_data(full_data_set=True)[['inhabitants']]

    td = datetime.timedelta(days=321, seconds=9877)
    dt = datetime.datetime(2021, 5, 3, 11, 28, 36, 388000)
    t = datetime.time(23, 11, 5)
    d = datetime.date(2020, 3, 11)
    d2 = datetime.date(2021, 7, 23)

    bt['td'] = td
    bt['dt'] = dt
    bt['t'] = t
    bt['d'] = d
    bt['d2'] = d2

    expected = [td, dt, t, d, d2]
    expected_types = ['timedelta', 'timestamp', 'time', 'date', 'date']

    bt['plus_t'] = bt.d + bt.t
    bt['plus_td'] = bt.d + bt.td # python returns date, pg timestamp
    expected.extend([ datetime.datetime(2020, 3, 11, 23, 11, 5), d + td])
    expected_types.extend(['timestamp', 'date'])

    with pytest.raises(ValueError, match='date - date operations are really broken in PG. '
                                         'Consider using timestamps'):
        bt['min_d'] = bt.d - bt.d2

    bt['min_t'] = bt.d - bt.t
    bt['min_td'] = bt.d - bt.td
    bt['min_dt'] = bt.d - bt.dt
    expected.extend([datetime.datetime(2020, 3, 10, 0, 48, 55), d-td,
                     datetime.timedelta(days=-419, seconds=45083, microseconds=612000)])
    expected_types.extend(['timestamp', 'date', 'timedelta'])

    assert [s.dtype for s in list(bt.all_series.values())[2:]] == expected_types

    assert_equals_data(
        bt[:1],
        expected_columns=list(bt.all_series.keys()),
        expected_data=[
            [1, 93485, *expected],
        ]
    )