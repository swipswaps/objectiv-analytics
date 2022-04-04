"""
Copyright 2022 Objectiv B.V.

There is some pytest 'magic' here that automatically fills out the 'engine' and 'dialect' parameters for
test functions that have either of those.
By default such a test function will get a Postgres dialect or engine. But if --big-query or --all is
specified on the commandline, then it will (also) get a BigQuery dialect or engine.

Additionally we define a 'pg_engine' fixture here that always return a Postgres engine.
"""
import os
from typing import NamedTuple, Optional

import pytest
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine, Dialect

DB_PG_TEST_URL = os.environ.get('OBJ_DB_PG_TEST_URL', 'postgresql://objectiv:@localhost:5432/objectiv')
DB_BQ_TEST_URL = os.environ.get('OBJ_DB_BQ_TEST_URL', 'bigquery://objectiv-snowplow-test-2/bach_test')
DB_BQ_CREDENTIALS_PATH = os.environ.get(
    'OBJ_DB_BQ_CREDENTIALS_PATH',
    os.path.dirname(os.path.dirname(os.path.realpath(__file__))) + '/.secrets/bach-big-query-testing.json'
)


@pytest.fixture()
def pg_engine() -> Engine:
    return sqlalchemy.create_engine(DB_PG_TEST_URL)


def pytest_addoption(parser):
    parser.addoption('--postgres', action='store_true', help='run the functional tests for Postgres')
    parser.addoption('--big-query', action='store_true', help='run the functional tests for BigQuery')
    parser.addoption('--all', action='store_true', help='run the functional tests for BigQuery')


def pytest_generate_tests(metafunc):
    need_engine = 'engine' in metafunc.fixturenames
    if metafunc.config.getoption("all"):
        engine_dialects = [
            get_postgres_engine_dialect(need_engine),
            get_bigquery_engine_dialect(need_engine)
        ]
    elif metafunc.config.getoption("big_query"):
        engine_dialects = [
            get_bigquery_engine_dialect(need_engine)
        ]
    else:  # default option, don't even check if --postgres is set
        engine_dialects = [
            get_postgres_engine_dialect(need_engine)
        ]

    if 'dialect' in metafunc.fixturenames:
        dialects = [ed.dialect for ed in engine_dialects]
        metafunc.parametrize("dialect", dialects)
    if 'engine' in metafunc.fixturenames:
        engines = [ed.engine for ed in engine_dialects]
        metafunc.parametrize("engine", engines)


# Below: helper functions for pytest_generate_tests


class EngineDialect(NamedTuple):
    engine: Optional[Engine]
    dialect: Optional[Dialect]


def get_postgres_engine_dialect(need_engine: bool = True) -> EngineDialect:
    if need_engine:
        engine = create_engine(DB_PG_TEST_URL)
        return EngineDialect(engine, engine.dialect)
    # Import locally. This way a missing library doesn't break anything, if we don't hit this code path
    from sqlalchemy.dialects.postgresql.base import PGDialect
    return EngineDialect(None, PGDialect())


def get_bigquery_engine_dialect(need_engine: bool = True) -> EngineDialect:
    if need_engine:
        engine = create_engine(DB_BQ_TEST_URL, credentials_path=DB_BQ_CREDENTIALS_PATH)
        return EngineDialect(engine, engine.dialect)
    # Import locally. This way a missing library doesn't break anything, if we don't hit this code path
    from sqlalchemy_bigquery import BigQueryDialect
    return EngineDialect(None, BigQueryDialect())
