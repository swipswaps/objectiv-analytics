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

    This also tackles the problem of duplicate events. Postgres has a unique index on the event_id, so will
    not allow for two events with the same id to be inserted (a unique event). Here we check which events
    were not inserted (because they violated the uniqueness constraint), and those are inserted in the
    not-ok data table (nok_data).

    Does not do any transaction management, this merely issues insert commands.
    :param connection: db connection
    :param events: list of events. Each event must be a valid Event, and must have a CookieIdContext
    """
    if not events:
        return
    duplicate_events = []
    values = []

    # We use 'on conflict do nothing'. With the read-committed isolation level this guarantees that this
    # transaction will not insert a row that will conflict with another transaction, even if the results
    # of that transaction are not yet visible to this transaction [1]. This guarantees that the transaction
    # will not fail later on at commit time, because there will be no conflicting rows at that time.
    # Furthermore the returning clause is guaranteed to only return the actually inserted rows [2]. So we
    # can use that to determine which rows were skipped because they violated the uniqueness constraint.
    #
    # [1] https://www.postgresql.org/docs/11/transaction-iso.html
    # [2] https://www.postgresql.org/docs/11/sql-insert.html
    insert_query = f'''
        insert into data(event_id, day, moment, cookie_id, value)
        values %s
        on conflict do nothing
        returning event_id
    '''
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
        inserted_event_ids = execute_values(
            cursor, insert_query, values, template=None, page_size=100, fetch=True)
        # Determine whether there were any duplicate events that were already in the table
        if len(inserted_event_ids) < len(events):
            inserted_event_ids_set = set(inserted_event_ids)
            for event in events:
                if event.id not in inserted_event_ids_set:
                    duplicate_events.append(event)
    # In case of duplicate events, we'll add those to the nok_data table for traceability
    if duplicate_events:
        insert_events_into_nok_data(connection, duplicate_events)


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
