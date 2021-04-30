"""
Copyright 2021 Objectiv B.V.
"""
import psycopg2
from psycopg2 import extras
from psycopg2.extensions import ISOLATION_LEVEL_READ_COMMITTED
import os


POSTGRES_USER = os.environ.get('POSTGRES_USER', 'objectiv')
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD', '0bj3ctiv')
POSTGRES_DB = os.environ.get('POSTGRES_DB', 'objectiv')
POSTGRES_HOSTNAME = os.environ.get('POSTGRES_HOSTNAME', 'localhost')
POSTGRES_PORT = os.environ.get('POSTGRES_PORT', '5432')


def get_db_connection():
    """
    Give a psycopg2 connection with repeatable_read isolation level and uuids enabled.
    """
    conn = psycopg2.connect(user=POSTGRES_USER,
                            password=POSTGRES_PASSWORD,
                            host=POSTGRES_HOSTNAME,
                            port=POSTGRES_PORT,
                            database=POSTGRES_DB)
    conn.set_session(isolation_level=ISOLATION_LEVEL_READ_COMMITTED)
    extras.register_uuid()
    return conn
