"""
Copyright 2022 Objectiv B.V.
"""
import os
from typing import NamedTuple, Optional

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine, Dialect

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
    need_engines = 'engine' in metafunc.fixturenames
    if metafunc.config.getoption("all"):
        postgres = _get_postgres(need_engines)
        bigquery = _get_bigquery(need_engines)
        engines = [postgres.engine, bigquery.engine]
        dialects = [postgres.dialect, bigquery.dialect]
    elif metafunc.config.getoption("big_query"):
        bigquery = _get_bigquery(need_engines)
        engines = [bigquery.engine]
        dialects = [bigquery.dialect]
    else:  # default option, don't even check if --postgres is set
        postgres = _get_postgres(need_engines)
        engines = [postgres.engine]
        dialects = [postgres.dialect]
    if 'dialect' in metafunc.fixturenames:
        metafunc.parametrize("dialect", dialects)
    if 'engine' in metafunc.fixturenames:
        metafunc.parametrize("engine", engines)


class EngineDialect(NamedTuple):
    engine: Optional[Engine]
    dialect: Optional[Dialect]


def _get_postgres(need_engine: bool) -> EngineDialect:
    if need_engine:
        engine = create_engine(DB_PG_TEST_URL)
        return EngineDialect(engine, engine.dialect)
    # Import locally. This way a missing library doesn't break anything unless with hit this code path
    from sqlalchemy.dialects.postgresql.base import PGDialect
    return EngineDialect(None, PGDialect())


def _get_bigquery(need_engine: bool) -> EngineDialect:
    if need_engine:
        engine = create_engine(DB_BQ_TEST_URL, credentials_path=DB_BQ_CREDENTIALS_PATH)
        return EngineDialect(engine, engine.dialect)
    # Import locally. This way a missing library doesn't break anything unless with hit this code path
    from sqlalchemy_bigquery import BigQueryDialect
    return EngineDialect(None, BigQueryDialect())
