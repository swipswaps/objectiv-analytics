"""
Copyright 2021 Objectiv B.V.
"""
import json
from datetime import datetime, timedelta
from typing import List

from psycopg2.extras import execute_values

from objectiv_backend.common.event_utils import get_context
from objectiv_backend.common.types import EventWithId


def insert_events_into_data(connection, events: List[EventWithId]):
    """
    Insert events into the 'data' table.
    Does not do any transaction management, this merely issues insert commands.
    :param connection: db connection
    :param events: list of events. Each event must be a valid Event, and must have a CookieIdContext
    """
    return _insert_events_into_table(connection=connection, table='data', events=events)


def insert_events_into_nok_data(connection, events: List[EventWithId]):
    """
    Insert events into the 'nok_data' table
    Does not do any transaction management, this merely issues insert commands.
    :param connection: db connection
    :param events: list of events. Each event must have a CookieIdContext
    """
    return _insert_events_into_table(connection=connection, table='nok_data', events=events)


def _insert_events_into_table(connection, table: str, events: List[EventWithId]):
    """
    Insert events into a table
    Does not do any transaction management, this merely issues insert commands.
    :param connection: db connection
    :param table: table to write to, either 'data' or 'nok_data'
    :param events: list of events. Each event must be a valid Event, and must have a CookieIdContext
    """
    if table not in ('data', 'nok_data'):
        raise ValueError(f'Table must be one of "data", "nok_data", value: {table}')

    if not events:
        return
    values = []

    insert_query = f'insert into {table}(event_id, day, moment, cookie_id, value) values %s'
    with connection.cursor() as cursor:
        for event in events:
            timestamp = _millis_to_datetime(event.event['time'])
            cookie_id = get_context(event.event, 'CookieIdContext')['cookie_id']
            value = (str(event.id),
                     timestamp,
                     timestamp,
                     cookie_id,
                     json.dumps(event.event))
            values.append(value)
        execute_values(cursor, insert_query, values, template=None, page_size=100)


def _millis_to_datetime(millis: int) -> datetime:
    """
    Convert an int with milliseconds since the epoch to a datetime object with milliseconds accuracy.
    """
    _event_seconds = millis // 1000
    _milli_seconds = millis % 1000
    timestamp = datetime.utcfromtimestamp(_event_seconds) + timedelta(milliseconds=_milli_seconds)
    return timestamp
