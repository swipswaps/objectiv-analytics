"""
Copyright 2021 Objectiv B.V.
"""
import sys
from typing import List

from objectiv_backend.common.config import WORKER_BATCH_SIZE
from objectiv_backend.common.enrich import enrich_event
from objectiv_backend.common.types import EventWithId
from objectiv_backend.workers.pg_queues import PostgresQueues, ProcessingStage
from objectiv_backend.workers.util import worker_main


def main_enrichment(connection) -> int:
    """
    Pick events from the enrichment queue, enrich the events, and write them to the finalize queue.
    :return number of processed events
    """
    with connection:
        pg_queues = PostgresQueues(connection=connection)
        events = pg_queues.get_events(queue=ProcessingStage.ENRICHMENT, max_items=WORKER_BATCH_SIZE)
        print(f'event-ids: {sorted(event.id for event in events)}')
        events = process_events_enrichment(events)
        pg_queues.put_events(queue=ProcessingStage.FINALIZE, events=events)
    return len(events)


def process_events_enrichment(events: List[EventWithId]) -> List[EventWithId]:
    # enrich events. todo: check schema
    events = [
        EventWithId(id=event.id, event=enrich_event(event=event.event))
        for event in events
    ]
    return events


if __name__ == '__main__':
    _loop = sys.argv[1:2] == ['--loop']
    worker_main(function=main_enrichment, loop=_loop)
