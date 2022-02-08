"""
Copyright 2021 Objectiv B.V.
"""
import pytest
import sqlalchemy

from bach import DataFrame
from tests.functional.bach.test_data_and_utils import get_pandas_df, TEST_DATA_CITIES, CITIES_COLUMNS, \
    DB_TEST_URL, assert_equals_data, get_bt_with_types_data
from uuid import UUID
import datetime

EXPECTED_COLUMNS = [
    '_index_skating_order', 'skating_order', 'city', 'municipality', 'inhabitants', 'founding'
]
EXPECTED_DATA = [
    [1, 1, 'Ljouwert', 'Leeuwarden', 93485, 1285],
    [2, 2, 'Snits', 'Súdwest-Fryslân', 33520, 1456],
    [3, 3, 'Drylts', 'Súdwest-Fryslân', 3055, 1268]
]

TEST_DATA_INJECTION = [
    [1, '{X}', "'test'", '"test"'],
    [2, '{{x}}', "{{test}}", "''test''\\''"]
]
COLUMNS_INJECTION = ['Index', 'X"x"', '{test}', '{te{}{{s}}t}']
# The expected data is what we put in, plus the index column, which equals the first column
EXPECTED_COLUMNS_INJECTION = [f'_index_{COLUMNS_INJECTION[0]}'] + COLUMNS_INJECTION
EXPECTED_DATA_INJECTION = [[row[0]] + row for row in TEST_DATA_INJECTION]


def test_from_pandas_table():
    pdf = get_pandas_df(TEST_DATA_CITIES, CITIES_COLUMNS)
    engine = sqlalchemy.create_engine(DB_TEST_URL)
    bt = DataFrame.from_pandas(
        engine=engine,
        df=pdf,
        convert_objects=True,
        name='test_from_pd_table',
        materialization='table',
        if_exists='replace'
    )
    assert_equals_data(bt, expected_columns=EXPECTED_COLUMNS, expected_data=EXPECTED_DATA)


def test_from_pandas_table_injection():
    pdf = get_pandas_df(TEST_DATA_INJECTION, COLUMNS_INJECTION)
    engine = sqlalchemy.create_engine(DB_TEST_URL)
    bt = DataFrame.from_pandas(
        engine=engine,
        df=pdf,
        convert_objects=True,
        name='test_from_pd_{table}_"injection"',
        materialization='table',
        if_exists='replace'
    )
    assert_equals_data(bt, expected_columns=EXPECTED_COLUMNS_INJECTION, expected_data=EXPECTED_DATA_INJECTION)


def test_from_pandas_ephemeral_basic():
    pdf = get_pandas_df(TEST_DATA_CITIES, CITIES_COLUMNS)
    engine = sqlalchemy.create_engine(DB_TEST_URL)
    bt = DataFrame.from_pandas(
        engine=engine,
        df=pdf,
        convert_objects=True,
        materialization='cte',
        name='ephemeral data'
    )
    assert_equals_data(bt, expected_columns=EXPECTED_COLUMNS, expected_data=EXPECTED_DATA)


def test_from_pandas_ephemeral_injection():
    pdf = get_pandas_df(TEST_DATA_INJECTION, COLUMNS_INJECTION)
    engine = sqlalchemy.create_engine(DB_TEST_URL)
    bt = DataFrame.from_pandas(
        engine=engine,
        df=pdf,
        convert_objects=True,
        materialization='cte',
        name='ephemeral data'
    )
    assert_equals_data(bt, expected_columns=EXPECTED_COLUMNS_INJECTION, expected_data=EXPECTED_DATA_INJECTION)


def test_from_pandas_non_happy_path():
    pdf = get_pandas_df(TEST_DATA_CITIES, CITIES_COLUMNS)
    engine = sqlalchemy.create_engine(DB_TEST_URL)
    with pytest.raises(ValueError):
        # if convert_objects is false, we'll get an error, because pdf's dtype for 'city' and 'municipality'
        # is 'object
        DataFrame.from_pandas(
            engine=engine,
            df=pdf,
            convert_objects=False,
            name='test_from_pd_table_convert_objects_false',
            materialization='table',
            if_exists='replace'
        )
    # Create the same table twice. This will fail if if_exists='fail'
    # Might fail on either the first or second try. As we don't clean up between tests.
    with pytest.raises(ValueError, match="Table 'test_from_pd_table' already exists"):
        DataFrame.from_pandas(
            engine=engine,
            df=pdf,
            convert_objects=True,
            name='test_from_pd_table',
            materialization='table',
        )
        DataFrame.from_pandas(
            engine=engine,
            df=pdf,
            convert_objects=True,
            name='test_from_pd_table',
            materialization='table',
        )

def test_from_pandas_other_types():
    df = get_bt_with_types_data()
    assert df.dtypes == {'uuid_column': 'uuid',
                         'jsonb_column_a': 'jsonb',
                         'moment': 'timestamp',
                         'date': 'timestamp'}

    assert_equals_data(
        df,
        expected_columns=['_index_uuid_column', 'uuid_column', 'jsonb_column_a', 'moment', 'date'],
        expected_data=[['36ca4c0b-804d-48ff-809f-28cf9afd078a', '36ca4c0b-804d-48ff-809f-28cf9afd078a', '{Sûkerbôlle}', datetime.datetime(2021, 5, 3, 11, 28, 36, 388), datetime.datetime(2021, 5, 3, 0, 0)], ['81a8ace2-273b-4b95-b6a6-0fba33858a22', '81a8ace2-273b-4b95-b6a6-0fba33858a22', '{Dúmkes}', datetime.datetime(2021, 5, 4, 23, 28, 36, 388), datetime.datetime(2021, 5, 4, 0, 0)], ['8a70b3d3-33ec-4300-859a-bb2efcf0b188', '8a70b3d3-33ec-4300-859a-bb2efcf0b188', '{"Grutte Pier Bier"}', datetime.datetime(2022, 5, 3, 14, 13, 13, 388), datetime.datetime(2022, 5, 3, 0, 0)]]
    )