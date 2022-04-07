"""
Copyright 2021 Objectiv B.V.
"""
from tests.functional.bach.test_data_and_utils import assert_equals_data, df_to_list, get_df_with_test_data


def test_sort_values_basic(engine):
    bt = get_df_with_test_data(engine)[['city']]
    bt = bt.sort_values('city')
    assert_equals_data(
        bt,
        expected_columns=['_index_skating_order', 'city'],
        expected_data=[
            [3, 'Drylts'],
            [1, 'Ljouwert'],
            [2, 'Snits'],
        ]
    )


def test_sort_values_expression(pg_engine):
    # TODO: BigQuery
    bt = get_df_with_test_data(pg_engine)[['city', 'inhabitants']]
    bt['city'] = bt['city'].str[2:]
    bt = bt.sort_values('city')
    assert_equals_data(
        bt,
        expected_columns=['_index_skating_order', 'city', 'inhabitants'],
        expected_data=[
            [2, 'its', 33520],
            [1, 'ouwert', 93485],
            [3, 'ylts', 3055],
        ]
    )


def test_sort_values_non_existing_column(engine):
    # Sort by an expression that is not in the DataFrame anymore
    bt = get_df_with_test_data(engine)[['city', 'inhabitants']]
    bt['city'] = bt['city'].str[2:]
    bt['City_Copy'] = bt['city']
    bt = bt.sort_values('City_Copy')
    bt = bt[['inhabitants']]
    assert_equals_data(
        bt,
        expected_columns=['_index_skating_order', 'inhabitants'],
        expected_data=[
            [2, 33520],
            [1, 93485],
            [3, 3055],
        ]
    )


def test_sort_values_parameters(engine):
    # call sort_values with different parameters, and compare with pandas output
    bt = get_df_with_test_data(engine, full_data_set=True)
    kwargs_list = [{'by': 'city'},
                   {'by': ['municipality', 'city']},
                   {'by': ['municipality', 'city'], 'ascending': False},
                   {'by': ['municipality', 'city'], 'ascending': [False, True]},
                   ]
    for kwargs in kwargs_list:
        assert_equals_data(
            bt.sort_values(**kwargs),
            expected_columns=['_index_skating_order', 'skating_order', 'city', 'municipality', 'inhabitants',
                              'founding'],
            expected_data=df_to_list(bt.to_pandas().sort_values(**kwargs))
        )
