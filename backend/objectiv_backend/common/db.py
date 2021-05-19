"""
Copyright 2021 Objectiv B.V.
"""
import psycopg2
from psycopg2 import extras
from psycopg2.extensions import ISOLATION_LEVEL_READ_COMMITTED

from objectiv_backend.common.config import PostgresConfig


def get_db_connection(pg_config: PostgresConfig):
    """
    Give a psycopg2 connection with repeatable_read isolation level and uuids enabled.
    """
    conn = psycopg2.connect(user=pg_config.user,
                            password=pg_config.password,
                            host=pg_config.hostname,
                            port=pg_config.port,
                            database=pg_config.database_name)
    conn.set_session(isolation_level=ISOLATION_LEVEL_READ_COMMITTED)
    extras.register_uuid()
    return conn
