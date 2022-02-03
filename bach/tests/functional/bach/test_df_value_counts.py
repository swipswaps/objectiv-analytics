import pandas as pd

from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data, \
    get_bt_with_railway_data


def test_value_counts_basic():
    bt = get_bt_with_test_data()[['municipality']]
    result = bt.value_counts()
    assert_equals_data(
        result.to_frame(),
        expected_columns=['municipality', 'value_counts_sum'],
        expected_data=[
            ['Súdwest-Fryslân', 2],
            ['Leeuwarden', 1]
        ],
    )


def test_value_counts_w_subset():
    bt = get_bt_with_railway_data()
    result = bt.value_counts(subset=['town', 'platforms'])
