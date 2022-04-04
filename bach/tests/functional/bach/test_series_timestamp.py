"""
Copyright 2021 Objectiv B.V.
"""
import datetime
from typing import List, Any

import pytest
from sqlalchemy.engine import Engine

from tests.functional.bach.test_data_and_utils import assert_equals_data, get_bt_with_food_data, \
    get_bt_with_test_data, get_df_with_test_data


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


def test_to_pandas():
    bt = get_bt_with_test_data()
    bt['dt'] = datetime.datetime(2021, 5, 3, 11, 28, 36, 388000)
    bt[['dt']].to_pandas()
    from numpy import array
    # TODO, this is not great, but at least it does not error when imported into pandas,
    # and it looks good over there
    assert bt[['dt']].to_numpy()[0] == [array(['2021-05-03T11:28:36.388000000'], dtype='datetime64[ns]')]


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


def test_timestamp_arithmetic(engine):
    data = [
        ['d', datetime.date(2020, 3, 11), 'date', (None, None)],
        ['t', datetime.time(23, 11, 5), 'time', (None, None)],
        ['td', datetime.timedelta(days=321, seconds=9877), 'timedelta', ('timestamp', 'timestamp')],
        ['dt', datetime.datetime(2021, 5, 3, 11, 28, 36, 388000), 'timestamp', (None, 'timedelta')]
    ]
    types_plus_min(engine, data, datetime.datetime(2019, 8, 16, 2, 54, 39, 166000), 'timestamp')


def types_plus_min(engine: Engine, data: List[list], base_value: Any, base_type: str):
    """
    Function to test all + and - operation combinations of data vs base, to make sure
    that all operations supported in python are supported in Bach and vice versa.
    Values returned by the DB as well as dtypes are checked.

    data is a list made up of lists, where the internal list are as follows:
    [ name, value, value_dtype, tuple(dtype_after_plus, dtype_after_min) ]
    - name is only for reference
    - value is the actual value in Python
    - value_dtype is the dtype in Bach for the value in Python
    - the tuple(dtype_after_plus, dtype_after_min) contains the dtypes that the resulting series should have.
    """
    bt = get_df_with_test_data(engine=engine, full_data_set=True)[['inhabitants']]

    base_name = 'base'
    bt[base_name] = base_value
    expected = [base_value]
    expected_types = [base_type]

    for name, value, value_type, (plus_type, min_type) in data:

        bt[name] = value
        expected.append(value)
        expected_types.append(value_type)

        try:
            # Do the python operation. Will raise TypeError is not supported
            expected.append(base_value + value)
        except TypeError as e:
            # Did we expected this operation to fail?
            assert(plus_type is None)

            with pytest.raises(TypeError):
                # it should also fail in Bach
                bt[base_name] + bt[name]
        else:
            # python operation finished successfully, now do the Bach one.
            bt[f'{base_name}_plus_{name}'] = bt[base_name] + bt[name]
            assert bt[f'{base_name}_plus_{name}'].dtype == plus_type

        try:
            # Do the python operation. Will raise TypeError is not supported
            expected.append(base_value - value)
        except TypeError as e:
            # Did we expected this operation to fail?
            assert(min_type is None)

            with pytest.raises(TypeError):
                # it should also fail in Bach
                bt[base_name] - bt[name]
        else:
            # python operation finished successfully, now do the Bach one.
            bt[f'{base_name}_min_{name}'] = bt[base_name] - bt[name]
            assert bt[f'{base_name}_min_{name}'].dtype == min_type

    assert_equals_data(
        bt[:1],
        expected_columns=list(bt.all_series.keys()),
        expected_data=[
            [1, 93485, *expected],
        ]
    )
    return bt, expected, expected_types