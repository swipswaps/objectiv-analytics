"""
Copyright 2021 Objectiv B.V.
"""
import pytest

from sql_models.util import is_postgres, is_bigquery
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data, df_to_list, \
    get_df_with_test_data
from tests.unit.bach.util import get_fake_df_test_data


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


def test_sort_values_expression():
    bt = get_bt_with_test_data()[['city', 'inhabitants']]
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


# TODO: below are unit tests, move them to tests/unit/bach/test_df_sort_values.py


def test_sort_values_wrong_parameters(dialect):
    bt = get_fake_df_test_data(dialect)
    with pytest.raises(KeyError):
        bt.sort_values('cityX')
    with pytest.raises(KeyError):
        bt.sort_values(['municipalityX', 'city'])
    with pytest.raises(TypeError):
        bt.sort_values({'municipality': False})
    with pytest.raises(ValueError):
        bt.sort_values(['municipality'], [False, True, True])
    with pytest.raises(ValueError):
        bt.sort_values(['municipality', 'city'], [False])


def test_generated_sql_order_last_select(dialect):
    # An earlier version of our code did include 'order by' statements, but not in the final select statement
    # This is not correct, but will often work and give a false sense of correctness.
    # The order by statement should be present in the final sql select. We test this by checking the last X
    # characters, this is a bit fragile but works okayish.
    bt = get_fake_df_test_data(dialect)
    sql_not_sorted = bt.view_sql()
    bt_sorted = bt.sort_values(by='city')
    sql_sorted = bt_sorted.view_sql()

    if is_postgres(dialect):
        expected_order_str = 'order by "city" asc'
    elif is_bigquery(dialect):
        expected_order_str = 'order by `city` asc'
    else:
        raise Exception(f'Need to expand test to support {dialect}')

    assert 'order by' not in sql_not_sorted[-60:]
    assert expected_order_str in sql_sorted[-60:]


def test_generated_sql_no_duplicate_sorting(dialect):
    # calling sort_values multiple times shouldn't result in multiple select statements being generated as
    # later sort statements cancel out earlier sort statements
    bt = get_fake_df_test_data(dialect)
    bt = bt.sort_values(by='city')
    first_sql = bt.view_sql()
    bt = bt.sort_values(by='municipality')
    bt = bt.sort_values(by='city')
    final_sql = bt.view_sql()
    assert first_sql == final_sql
