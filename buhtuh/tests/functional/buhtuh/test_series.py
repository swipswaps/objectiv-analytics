"""
Copyright 2021 Objectiv B.V.
"""
from tests.functional.buhtuh.test_data_and_utils import get_bt_with_test_data, assert_equals_data, df_to_list


def test_series_sort_values():
    bt = get_bt_with_test_data(full_data_set=True)
    bt_series = bt.city
    kwargs_list = [{'ascending': True},
                   {'ascending': False},
                   {}
                   ]
    for kwargs in kwargs_list:
        assert_equals_data(
            bt_series.sort_values(**kwargs),
            expected_columns=['_index_skating_order', 'city'],
            expected_data=df_to_list(bt.to_df()['city'].sort_values(**kwargs))
        )
