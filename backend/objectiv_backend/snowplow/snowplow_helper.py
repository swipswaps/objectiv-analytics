from typing import Dict

import base64
import json
from datetime import datetime
from urllib.parse import urlparse

from objectiv_backend.snowplow.schema.ttypes import *

from google.cloud import pubsub_v1

from thrift.protocol import TBinaryProtocol
from thrift.transport import TTransport

from objectiv_backend.common.config import get_collector_config
from objectiv_backend.common.event_utils import get_context
from objectiv_backend.common.types import EventDataList, EventData


def make_snowplow_custom_context(event: Dict) -> str:
    config = get_collector_config().output.snowplow
    snowplow_contexts_schema = config.schema_contexts
    outer_event = {
        'schema': snowplow_contexts_schema,
        'data': [event]
    }
    outer_event_json = json.dumps(outer_event)
    return str(base64.b64encode(outer_event_json.encode('UTF-8')), 'UTF-8')


def objectiv_event_to_snowplow(event: EventData) -> Dict:
    config = get_collector_config().output.snowplow
    objectiv_schema = config.schema_objectiv_taxonomy

    return {
        'schema': objectiv_schema,
        'data': event
    }


def objectiv_event_to_snowplow_payload(event: EventData) -> CollectorPayload:
    config = get_collector_config().output.snowplow

    snowplow_payload_data_schema = config.schema_payload_data
    snowplow_collector_payload_schema = config.schema_collector_payload

    payload = {
        "schema": snowplow_payload_data_schema,
        "data": []
    }

    try:
        http_context = get_context(event, 'HttpContext')
    except ValueError:
        http_context = {}

    try:
        cookie_context = get_context(event, 'CookieIdContext')
    except ValueError:
        cookie_context = {}

    try:
        path_context = get_context(event, 'PathContext')
    except ValueError:
        path_context = {}

    query_string = urlparse(path_context.get('id', '')).query

    rich_event = {'event_id' if k == 'id' else k: v for k, v in event.items()}
    rich_event['cookie_id'] = cookie_context.get('id', '')

    snowplow_event = objectiv_event_to_snowplow(rich_event)
    snowplow_custom_context = make_snowplow_custom_context(snowplow_event)
    payload["data"].append({
        "e": "se",  # mandatory: event type: structured event
        "p": "web",  # mandatory: platform
        "tv": "objectiv-tracker-0.0.5",  # mandatory: tracker version
        "url": path_context.get('id', ''),
        "cx": snowplow_custom_context})

    return CollectorPayload(
        schema=snowplow_collector_payload_schema,
        ipAddress=http_context.get('remote_address', ''),
        timestamp=int(datetime.now().timestamp() * 1000),
        encoding='UTF-8',
        collector='objectiv_collector',
        userAgent=http_context.get('user_agent', ''),
        refererUri=http_context.get('referrer', ''),
        path='/com.snowplowanalytics.snowplow/tp2',
        querystring=query_string,
        body=json.dumps(payload),
        headers=[],
        contentType='application/json',
        hostname='',
        networkUserId=cookie_context.get('id', '')
    )


def payload_to_thrift(payload: CollectorPayload) -> str:
    """
    Generate Thrift message for payload, based on Thrift schema here:
        https://github.com/snowplow/snowplow/blob/master/2-collectors/thrift-schemas/collector-payload-1/src/main/thrift/collector-payload.thrift
    :param payload: CollectorPayload - class instance representing Thrift message
    :return: serialized string
    """
    transport = TTransport.TMemoryBuffer()
    protocol = TBinaryProtocol.TBinaryProtocol(transport)
    payload.write(protocol)

    return transport.getvalue()


def write_data_to_pubsub(events: EventDataList) -> None:
    config = get_collector_config().output.snowplow

    project = config.gcp_project
    topic = config.gcp_pubsub_topic_raw

    publisher = pubsub_v1.PublisherClient()
    topic_path = f'projects/{project}/topics/{topic}'

    for event in events:
        payload: CollectorPayload = objectiv_event_to_snowplow_payload(event)
        data = payload_to_thrift(payload)
        publisher.publish(topic_path, data)


def write_data_to_kinesis(events: EventDataList) -> None:
    pass