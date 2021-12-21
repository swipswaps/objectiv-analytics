"""
Copyright 2021 Objectiv B.V.
"""
import pytest

from sql_models.model import Materialization
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data
from tests.functional.bach.test_savepoints import remove_created_db_objects


def test_savepoint_simple():
    # setup
    df = get_bt_with_test_data()
    engine = df.engine

    # all expected values
    expected_results = {
        'savepoint1': [
            (1, 1, 'Ljouwert', 'Leeuwarden', 93485, 1285),
            (2, 2, 'Snits', 'Súdwest-Fryslân', 33520, 1456),
            (3, 3, 'Drylts', 'Súdwest-Fryslân', 3055, 1268)
        ],
        'savepoint2': [
            (1, 'Ljouwert', 1285, 'abcdef'),
            (2, 'Snits', 1456, 'abcdef'),
            (3, 'Drylts', 1268, 'abcdef')
        ],
        'savepoint3': [
            (2, 'Snits', 'Súdwest-Fryslân'),
        ]
    }

    # actual tests
    df.set_savepoint("savepoint1")

    result = df.savepoints.execute_sql(engine)
    expected = {key: expected_results[key]for key in ['savepoint1']}
    assert result.data == expected

    df['x'] = 'abcdef'
    df = df[['city', 'founding', 'x']]
    df.set_savepoint("savepoint2")

    result = df.savepoints.execute_sql(engine)
    expected = {key: expected_results[key] for key in ['savepoint1', 'savepoint2']}
    assert result.data == expected

    df = df.savepoints.get_df('savepoint1')
    df = df[df.skating_order == 2]
    df = df[['city', 'municipality']]
    # TODO: there is a bug in is_materialized. The df is marked as materialized because all columns are
    # unchanged, however the fact that some columns are missing (compared to the base_node) is not
    # accounted for. Therefore we'll have to do a manual materialize here
    df.materialize(inplace=True)
    df.set_savepoint('savepoint3')

    result = df.savepoints.execute_sql(engine)
    assert result.data == expected_results


def test_savepoint_tables():
    df = get_bt_with_test_data()

    engine = df.engine
    df.set_savepoint("savepoint1", 'table')
    df['x'] = 'abcdef'
    df = df[['city', 'founding', 'x']]
    df.set_savepoint("savepoint2", 'view')

    df = df.savepoints.get_df('savepoint1')
    df = df[df.skating_order == 2]
    df = df[['city', 'municipality']]
    df.set_savepoint('savepoint3', Materialization.VIEW)

    expected_columns = ['_index_skating_order', 'city', 'municipality']
    expected_data = [[2, 'Snits', 'Súdwest-Fryslân']]

    assert_equals_data(df, expected_columns=expected_columns, expected_data=expected_data)

    with pytest.raises(ValueError, match='has not been materialized'):
        # Try to get the DataFrame that queries directly from the 'savepoint3' view in the database
        # This will fail because that view has not been created yet.
        df.savepoints.get_materialized_df(engine, 'savepoint3')

    # Create tables and views, then try again
    execute_result = df.savepoints.execute_sql(engine)
    df_mat = df.savepoints.get_materialized_df(engine, 'savepoint3')
    assert_equals_data(df_mat, expected_columns=expected_columns, expected_data=expected_data)

    # Test clean up:
    # TODO: make test clean-up robust to failures half-way
    remove_created_db_objects(engine, execute_result.created)
