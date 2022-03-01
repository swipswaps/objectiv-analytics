"""
Copyright 2022 Objectiv B.V.
"""
import os
from sqlalchemy import create_engine

DB_PG_TEST_URL = os.environ.get('OBJ_DB_PG_TEST_URL', 'postgresql://objectiv:@localhost:5432/objectiv')
DB_BQ_TEST_URL = os.environ.get('OBJ_DB_BQ_TEST_URL', 'bigquery://objectiv-snowplow-test-2/bach_test')
DB_BQ_CREDENTIALS_PATH = os.environ.get(
    'OBJ_DB_BQ_CREDENTIALS_PATH',
    '/home/thijs/.work_secret/objectiv-snowplow-test-2_bach-big-query-testing.json'
)


def pytest_addoption(parser):
    parser.addoption('--postgres', action='store_true', help='run the functional tests for Postgres')
    parser.addoption('--big-query', action='store_true', help='run the functional tests for BigQuery')
    parser.addoption('--all', action='store_true', help='run the functional tests for BigQuery')


def pytest_generate_tests(metafunc):
    if 'engine' in metafunc.fixturenames:
        # default: Postgres
        engines = [create_engine(DB_PG_TEST_URL)]
        if metafunc.config.getoption("all"):
            engines = [
                create_engine(DB_PG_TEST_URL),
                create_engine(DB_BQ_TEST_URL, credentials_path=DB_BQ_CREDENTIALS_PATH)
            ]
        elif metafunc.config.getoption("big_query"):
            engines = [create_engine(DB_BQ_TEST_URL, credentials_path=DB_BQ_CREDENTIALS_PATH)]
        elif metafunc.config.getoption("postgres"):
            engines = [create_engine(DB_PG_TEST_URL)]
        metafunc.parametrize("engine", engines)
