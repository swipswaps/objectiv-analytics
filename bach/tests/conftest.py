"""
Copyright 2022 Objectiv B.V.

There is some pytest 'magic' here that automatically fills out the 'engine' and 'dialect' parameters for
test functions that have either of those.
By default such a test function will get a Postgres dialect or engine. But if --big-query or --all is
specified on the commandline, then it will (also) get a BigQuery dialect or engine.

Additionally we define a 'pg_engine' fixture here that always return a Postgres engine.
"""
import os
from typing import NamedTuple, Optional, Dict

import pytest
from _pytest.main import Session
from _pytest.python import Metafunc, Function
from _pytest.config.argparsing import Parser
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
    # TODO: port all tests that use this to be multi-database>
    return get_postgres_engine_dialect().engine


@pytest.fixture()
def bq_engine() -> Engine:
    # TODO: port all tests that use this to be multi-database>
    return get_bigquery_engine_dialect().engine


def pytest_addoption(parser: Parser):
    # Add options for parameterizing multi-database tests for testing either Postgres, Bigquery, or both.
    # The actual parameterizing happens in pytest_generate_tests(), based on the paramters that the user
    # provides

    # This function will automatically be called by pytest at the start of a test run, see:
    # https://docs.pytest.org/en/6.2.x/reference.html#initialization-hooks
    parser.addoption('--postgres', action='store_true', help='run the functional tests for Postgres')
    parser.addoption('--big-query', action='store_true', help='run the functional tests for BigQuery')
    parser.addoption('--all', action='store_true', help='run the functional tests for BigQuery')


class EngineDialect(NamedTuple):
    engine: Optional[Engine]
    dialect: Optional[Dialect]


ENGINE_DIALECTS: Dict[str, EngineDialect] = {}


def pytest_sessionstart(session: Session):
    # Initialize ENGINE_DIALECTS per pytest-xdist worker session based on current pytest running config.
    # This way we avoid the creation of a new engine per test, as this is quite inefficient and might
    # cause failures due to multiple clients trying to connect to db server.

    # For more information, please see:
    # https://pytest-xdist.readthedocs.io/en/latest/distribution.html
    # https://docs.pytest.org/en/6.2.x/reference.html#pytest.hookspec.pytest_sessionstart
    load_engine = True
    if session.config.args == ['tests/unit']:
        # create dialect, only if we are running unit tests
        load_engine = False

    if session.config.getoption("all"):
        ENGINE_DIALECTS['postgres'] = get_postgres_engine_dialect(load_engine)
        ENGINE_DIALECTS['bigquery'] = get_bigquery_engine_dialect(load_engine)
    elif session.config.getoption("big_query"):
        ENGINE_DIALECTS['bigquery'] = get_bigquery_engine_dialect(load_engine)
    else:  # default option, don't even check if --postgres is set
        ENGINE_DIALECTS['postgres'] = get_postgres_engine_dialect(load_engine)


def pytest_generate_tests(metafunc: Metafunc):
    # Paramaterize the 'engine' and 'dialect' parameters of tests based on the options specified by the
    # user (see pytest_addoption() for options).

    # This function will automatically be called by pytest while it is creating the list of tests to run,
    # see: https://docs.pytest.org/en/6.2.x/reference.html#collection-hooks
    engine_dialects = list(ENGINE_DIALECTS.values())
    if 'dialect' in metafunc.fixturenames:
        dialects = [ed.dialect for ed in engine_dialects]
        metafunc.parametrize("dialect", dialects)
    if 'engine' in metafunc.fixturenames:
        engines = [ed.engine for ed in engine_dialects]
        metafunc.parametrize("engine", engines)


def pytest_runtest_setup(item: Function):
    # Here we check that tests that are marked as `db_independent`, that they do not have a `dialect` or
    # `engine` parameter.
    #
    #  ### Background ###
    #  We broadly want two categories of tests:
    #  1. tests that are database independent.
    #  2. tests that we want to run against all supported databases.
    #
    # These categories shouldn't overlap. We use the `db_independent` mark to track category one, and we can
    # distinguish tests from category two by their 'dialect' and 'engine' parameters. This way we can verify
    # that all tests are clearly marked as being in either category.

    # This function will automatically be called by pytest before running a specific test function. See:
    # https://docs.pytest.org/en/6.2.x/reference.html#test-running-runtest-hooks
    fixture_names = item.fixturenames
    is_db_independent_test = any(mark.name == 'db_independent' for mark in item.own_markers)
    is_multi_db_test = 'dialect' in fixture_names or 'engine' in fixture_names
    if is_db_independent_test and is_multi_db_test:
        raise Exception('Test has both the `db_independent` mark as well as either the `dialect` or '
                        '`engine` parameter. Test can not be both database independent and multi-database.')

# Below: helper functions for pytest_sessionstart


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
