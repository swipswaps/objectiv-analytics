"""
Copyright 2022 Objectiv B.V.
"""
from sqlalchemy.engine import Connection, Engine


def is_postgres(engine: Engine) -> bool:
    return engine.name == 'postgresql'  # value of PGDialect.name


def is_bigquery(engine: Engine) -> bool:
    # We hardcode the string value here instead of comparing against BigQueryDialect.name
    # This way this code path will work, even if the BigQuery python package is not installed
    return engine.name == 'bigquery'


def escape_parameter_characters(conn: Connection, raw_sql: str) -> str:
    """
    Return a modified copy of the given sql with the query-parameter special characters escaped.
    e.g. if the connection uses '%' to mark a parameter, then all occurrences of '%' will be replaced by '%%'
    """
    # for now we'll just assume Postgres and assume the pyformat parameter style is used.
    # When we support more databases we'll need to do something smarter, see
    # https://www.python.org/dev/peps/pep-0249/#paramstyle
    return raw_sql.replace('%', '%%')


class DatabaseNotSupportedException(Exception):
    def __init__(self, engine: Engine):
        super().__init__(f'This function is not supported for database engine "{engine.name}".')
