"""
Copyright 2021 Objectiv B.V.
"""
from typing import List

import pytest
from sqlalchemy.future import Engine

from bach.savepoints import Savepoints, CreatedObject
from sql_models.model import Materialization
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data


def test_add_savepoint():
    df = get_bt_with_test_data()
    sps = Savepoints()
    sps.add_savepoint('test', df, Materialization.TABLE)
    df2 = df.groupby('municipality').min()
    sps.add_savepoint('test2', df2, Materialization.TABLE)

    # Assert that we can get a copy of the original dataframes back again
    assert sps.get_df('test') is not df
    assert sps.get_df('test') == df
    assert sps.get_df('test2') is not df2
    assert sps.get_df('test2') == df2
    # Assert that we can get all savepoints
    assert len(sps.all) == 2


def test_execute_sql_queries():
    df = get_bt_with_test_data()
    engine = df.engine
    sps = Savepoints()
    sps.add_savepoint('the_name', df, Materialization.QUERY)
    result = sps.execute_sql(engine)
    assert result.data == {
        'the_name': [
            (1, 1, 'Ljouwert', 'Leeuwarden', 93485, 1285),
            (2, 2, 'Snits', 'Súdwest-Fryslân', 33520, 1456),
            (3, 3, 'Drylts', 'Súdwest-Fryslân', 3055, 1268)
        ]
    }
    assert result.created == []

    df = df[df.skating_order < 3]
    df = df.materialize()
    sps.add_savepoint('second_point', df, Materialization.QUERY)
    result = sps.execute_sql(engine)
    assert result.data == {
        'the_name': [
            (1, 1, 'Ljouwert', 'Leeuwarden', 93485, 1285),
            (2, 2, 'Snits', 'Súdwest-Fryslân', 33520, 1456),
            (3, 3, 'Drylts', 'Súdwest-Fryslân', 3055, 1268)
        ],
        'second_point': [
            (1, 1, 'Ljouwert', 'Leeuwarden', 93485, 1285),
            (2, 2, 'Snits', 'Súdwest-Fryslân', 33520, 1456)
        ]
    }
    assert result.created == []


def test_execute_sql_create_objects():
    df = get_bt_with_test_data()
    engine = df.engine
    sps = Savepoints()

    df = df.materialize()
    sps.add_savepoint('sp_first_point', df, Materialization.TABLE)

    # reduce df to one row and add savepoint
    df = df[df.skating_order == 1]
    df = df.materialize()
    sps.add_savepoint('sp_second_point', df, Materialization.VIEW)

    # Change columns in df and add savepoint
    df = df[['skating_order', 'city', 'founding']]
    df['x'] = 12345
    df = df.materialize()
    sps.add_savepoint('sp_third_point', df, Materialization.TABLE)

    # No changes, add query
    df = df.materialize()
    sps.add_savepoint('sp_final_point', df, Materialization.QUERY)

    expected_data = {
        'sp_final_point': [
            (1, 1, 'Ljouwert', 1285, 12345),
        ]
    }
    expected_object_names = ['sp_first_point', 'sp_second_point', 'sp_third_point']

    result = sps.execute_sql(engine)
    assert result.data == expected_data
    assert [co.name for co in result.created] == expected_object_names
    assert sps.to_sql()['sp_final_point'] == \
           'select "_index_skating_order", "skating_order", "city", "founding", "x" from ' \
           '"sp_third_point"   limit all'

    with pytest.raises(Exception):
        # We expect a DB exception if we try to recreate the same tables/views
        sps.execute_sql(engine)

    # Recreating with overwrite=True should work tho, as that drops the tables/views first
    result = sps.execute_sql(engine, overwrite=True)
    assert result.data == expected_data
    assert [co.name for co in result.created] == expected_object_names

    # Test clean up:
    # TODO: make test clean-up robust to failures half-way
    remove_created_db_objects(engine, result.created)


def remove_created_db_objects(engine: Engine, created_objects: List[CreatedObject]):
    """ Utility function: remove the tables and views that were created. """
    with engine.connect() as conn:
        for object in reversed(created_objects):
            if object.materialization == Materialization.TABLE:
                conn.execute(f'drop table "{object.name}";')
            elif object.materialization == Materialization.VIEW:
                conn.execute(f'drop view "{object.name}";')
            else:
                raise Exception("unhandled case")
