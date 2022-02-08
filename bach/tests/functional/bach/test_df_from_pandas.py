"""
Copyright 2021 Objectiv B.V.
"""
import pytest
import sqlalchemy

from bach import DataFrame
from tests.functional.bach.test_data_and_utils import get_pandas_df, TEST_DATA_CITIES, CITIES_COLUMNS, \
    DB_TEST_URL, assert_equals_data
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


@pytest.mark.parametrize("materialization", ['cte', 'table'])
def test_from_pandas_other_types(materialization: str):
    from uuid import UUID
    import pandas as pd

    pdf = pd.DataFrame({'int_column': [1, 2, 3],
                        'float_column': [1.324, 2.734, 3.52],
                        'bool_column': [True, True, False],
                        'datetime_column': [datetime.datetime(2021, 5, 3, 11, 28, 36, 388),
                                            datetime.datetime(2021, 5, 4, 23, 28, 36, 388),
                                            datetime.datetime(2022, 5, 3, 14, 13, 13, 388)],
                        'string_column': ['Ljouwert', 'Snits', 'Drylts'],
                        'date_column': [datetime.date(2021, 5, 3), datetime.date(2021, 5, 4),
                                        datetime.date(2022, 5, 3)],
                        'list_column': [['Sûkerbôlle'], ['Dúmkes'], ['Grutte Pier Bier']],
                        'uuid_column': [UUID('36ca4c0b-804d-48ff-809f-28cf9afd078a'),
                                        UUID('81a8ace2-273b-4b95-b6a6-0fba33858a22'),
                                        UUID('8a70b3d3-33ec-4300-859a-bb2efcf0b188')],
                        'dict_column': [{'a': 'b'}, {'c': ['d', 'e']}, {'f': 'g', 'h': 'i'}],
                        'mixed_column': [datetime.date(2021, 5, 3), ['Dúmkes'], ['Grutte Pier Bier']]
                        }).set_index('int_column', drop=False)

    engine = sqlalchemy.create_engine(DB_TEST_URL)
    df = DataFrame.from_pandas(
        engine=engine,
        df=pdf.loc[:, :'dict_column'],
        convert_objects=True,
        name='test_from_pd_table',
        materialization=materialization,
        if_exists='replace'
    )

    assert df.dtypes == {'int_column': 'int64', 'float_column': 'float64', 'bool_column': 'bool',
                         'datetime_column': 'timestamp', 'string_column': 'string', 'date_column': 'date',
                         'list_column': 'jsonb', 'uuid_column': 'uuid', 'dict_column': 'jsonb'}

    assert_equals_data(
        df,
        expected_columns=[
            '_index_int_column',
            'int_column',
            'float_column',
            'bool_column',
            'datetime_column',
            'string_column',
            'date_column',
            'list_column',
            'uuid_column',
            'dict_column'
        ],
        expected_data=[
            [1, 1, 1.324, True, datetime.datetime(2021, 5, 3, 11, 28, 36, 388), 'Ljouwert', datetime.date(2021, 5, 3),
             ['Sûkerbôlle'], UUID('36ca4c0b-804d-48ff-809f-28cf9afd078a'), {'a': 'b'}],
            [2, 2, 2.734, True, datetime.datetime(2021, 5, 4, 23, 28, 36, 388), 'Snits', datetime.date(2021, 5, 4),
             ['Dúmkes'], UUID('81a8ace2-273b-4b95-b6a6-0fba33858a22'), {'c': ['d', 'e']}],
            [3, 3, 3.52, False, datetime.datetime(2022, 5, 3, 14, 13, 13, 388), 'Drylts', datetime.date(2022, 5, 3),
             ['Grutte Pier Bier'], UUID('8a70b3d3-33ec-4300-859a-bb2efcf0b188'), {'f': 'g', 'h': 'i'}]
        ]
    )

    with pytest.raises(ValueError, match="multiple types found in column"):
        DataFrame.from_pandas(
            engine=engine,
            df=pdf,
            convert_objects=True,
            name='test_from_pd_table',
            materialization=materialization,
            if_exists='replace'
        )
