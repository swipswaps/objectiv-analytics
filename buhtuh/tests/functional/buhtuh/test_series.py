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


def test_type_agnostic_aggregation_functions():
    bt = get_bt_with_test_data(full_data_set=True)
    btg = bt.groupby()

    # type agnostic aggregations
    aggregation_functions = ['count', 'max', 'min', 'nunique', 'mode', 'median']
    result_bt = btg[['municipality']].aggregate(aggregation_functions)

    result_series_dtypes = {
        'municipality_count': 'int64',
        'municipality_max': 'string',
        'municipality_min': 'string',
        'municipality_nunique': 'int64',
        'municipality_mode': 'string',
        'municipality_median': 'string'
    }

    assert_equals_data(
        result_bt,
        expected_columns=['index'] + list(result_series_dtypes.keys()),
        expected_data=[
            [1, 11, 'Waadhoeke', 'De Friese Meren', 6, 'Súdwest-Fryslân', 'Súdwest-Fryslân']
        ]
    )
    assert result_bt.index_dtypes == {
        'index': 'int64'
    }
    assert result_bt.dtypes == result_series_dtypes