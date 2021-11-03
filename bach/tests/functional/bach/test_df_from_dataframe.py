"""
Copyright 2021 Objectiv B.V.
"""
import pytest
import sqlalchemy

from bach import DataFrame
from tests.functional.bach.test_data_and_utils import get_pandas_df, TEST_DATA_CITIES, CITIES_COLUMNS, \
    DB_TEST_URL, assert_equals_data

EXPECTED_COLUMNS = [
    '_index_skating_order', 'skating_order', 'city', 'municipality', 'inhabitants', 'founding'
]
EXPECTED_DATA = [
    [1, 1, 'Ljouwert', 'Leeuwarden', 93485, 1285],
    [2, 2, 'Snits', 'Súdwest-Fryslân', 33520, 1456],
    [3, 3, 'Drylts', 'Súdwest-Fryslân', 3055, 1268]
]


def test_from_dataframe_materialized():
    pdf = get_pandas_df(TEST_DATA_CITIES, CITIES_COLUMNS)
    engine = sqlalchemy.create_engine(DB_TEST_URL)
    bt = DataFrame.from_dataframe(
        df=pdf,
        name='test_from_dataframe_table',
        engine=engine,
        convert_objects=True,
        if_exists='replace'
    )
    assert_equals_data(bt, expected_columns=EXPECTED_COLUMNS, expected_data=EXPECTED_DATA)


def test_from_dataframe_ephemeral():
    pdf = get_pandas_df(TEST_DATA_CITIES, CITIES_COLUMNS)
    engine = sqlalchemy.create_engine(DB_TEST_URL)
    # todo: switch to new function
    bt = DataFrame.from_dataframe(
        df=pdf,
        name='test_from_dataframe_table',
        engine=engine,
        convert_objects=True,
        if_exists='replace'
    )
    assert_equals_data(bt, expected_columns=EXPECTED_COLUMNS, expected_data=EXPECTED_DATA)



def test_from_dataframe_non_happy_path():
    pdf = get_pandas_df(TEST_DATA_CITIES, CITIES_COLUMNS)
    engine = sqlalchemy.create_engine(DB_TEST_URL)
    with pytest.raises(ValueError):
        # if convert_objects is false, we'll get an error, because pdf's dtype for 'city' and 'municipality'
        # is 'object
        DataFrame.from_dataframe(
            df=pdf,
            name='test_from_dataframe_table_convert_objects_false',
            engine=engine,
            convert_objects=False,
            if_exists='replace'
        )
    # Create the same table twice. This will fail if if_exists='fail'
    # Might fail on either the first or second try. As we don't clean up between tests.
    with pytest.raises(ValueError, match="Table 'test_from_dataframe_table' already exists"):
        DataFrame.from_dataframe(
            df=pdf,
            name='test_from_dataframe_table',
            engine=engine,
            convert_objects=True,
        )
        DataFrame.from_dataframe(
            df=pdf,
            name='test_from_dataframe_table',
            engine=engine,
            convert_objects=True,
        )
