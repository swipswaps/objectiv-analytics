"""
Copyright 2021 Objectiv B.V.

Functions to write data to S3 and the local filesystem.

This is experimental code, and not ready for production use.
"""
import json
import requests
import base64
from datetime import datetime
from io import BytesIO
from typing import List,Dict

import boto3
from botocore.exceptions import ClientError

from objectiv_backend.common.config import get_collector_config
from objectiv_backend.common.types import EventDataList, EventData
#from objectiv_backend.end_points.collector import collect


def events_to_json(events: EventDataList) -> str:
    """
    Convert list of events to a string with on each line a json object representing a single event.
    Note that the returned string is not a json list; This format makes it suitable as raw input to AWS
    Athena.
    """
    return json.dumps(events)


def write_data_to_fs_if_configured(data: str, prefix: str, moment: datetime) -> None:
    """
    Write data to disk, if file_system output is configured. If file_system output is not configured, then
    this function returns directly.
    :param data: data to write
    :param prefix: directory prefix, added to path after the configured path/ and before /filename.json
    :param moment: timestamp that the data arrived
    """
    fs_config = get_collector_config().output.file_system
    if not fs_config:
        return
    timestamp = moment.timestamp()
    path = f'{fs_config.path}/{prefix}/{timestamp}.json'
    with open(path, 'w') as of:
        of.write(data)


def write_data_to_s3_if_configured(data: str, prefix: str, moment: datetime) -> None:
    """
    Write data to AWS S3, if S3 output is configured. if aws s3 output is not configured, then this
    function returns directly.
    :param data: data to write
    :param prefix: prefix, included in the keyname after the configured path/ and datestamp/ and
        before /filename.json
    :param moment: timestamp that the data arrived
    """
    aws_config = get_collector_config().output.aws
    if not aws_config:
        return

    timestamp = moment.timestamp()
    datestamp = moment.strftime('%Y/%m/%d')
    object_name = f'{aws_config.s3_prefix}/{datestamp}/{prefix}/{timestamp}.json'
    file_obj = BytesIO(data.encode('utf-8'))
    s3_client = boto3.client(
        service_name='s3',
        region_name=aws_config.region,
        aws_access_key_id=aws_config.access_key_id,
        aws_secret_access_key=aws_config.secret_access_key)
    try:
        s3_client.upload_fileobj(file_obj, aws_config.bucket, object_name)
    except ClientError as e:
        print(f'Error uploading to s3: {e} ')


def make_snowplow_custom_context(event: Dict) -> str:

    outer_event = {
        "schema": "iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0",
        "data": [event]
    }
    outer_event_json = json.dumps(outer_event)
    return str(base64.b64encode(outer_event_json.encode('UTF-8')), 'UTF-8')


def objectiv_event_to_snowplow(event: EventData, version='1-0-0') -> Dict:
    return {
        "schema": f"iglu:io.objectiv/taxonomy/jsonschema/{version}",
        "data": event
    }


from objectiv_backend.snowplow.schema.ttypes import *
from objectiv_backend.common.event_utils import get_context


def write_data_to_pubsub(events: EventDataList) -> None:
    from google.cloud import pubsub_v1

    from thrift.protocol import TBinaryProtocol
    from thrift.transport import TTransport

    publisher = pubsub_v1.PublisherClient()
    topic_path = 'projects/objectiv-snowplow-test-2/topics/sp-raw-topic'

    for event in events:
        payload = {
            "schema": "iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4",
            "data": []
        }

        try:
             http_context = get_context(event, 'HttpContext')
        except ValueError:
            print(json.dumps(event, indent=4))
            http_context = {
                'user_agent': ''
            }
        try:
            cookie_context = get_context(event, 'CookieIdContext')
        except ValueError:
            cookie_context = {}

        path_context = get_context(event, 'PathContext')

        rich_event = {k: v for k, v in event.items()}
        rich_event['event_id'] = rich_event['id']
        del rich_event['id']
        rich_event['cookie_id'] = cookie_context['id']

        snowplow_event = objectiv_event_to_snowplow(rich_event, '2-0-1')
        snowplow_custom_context = make_snowplow_custom_context(snowplow_event)
        payload["data"].append({
            "e": "se",  # mandatory: event type: structured event
            "p": "web",  # mandatory: platform
            "tv": "objectiv-tracker-0.0.5",  # mandatory: tracker version
            "url": path_context['id'],
            "cx": snowplow_custom_context})
        data = CollectorPayload(
            schema="iglu:com.snowplowanalytics.snowplow/CollectorPayload/thrift/1-0-0",
            ipAddress=http_context['remote_address'],
            timestamp=int(datetime.now().timestamp()*1000),
            encoding='UTF-8',
            collector='objectiv_collector',
            userAgent=http_context['user_agent'],
            refererUri=http_context['referrer'],
            path='/com.snowplowanalytics.snowplow/tp2',
            querystring=None,
            body=json.dumps(payload),
            headers=[],
            contentType='application/json',
            hostname='1.2.3.4',
            networkUserId=cookie_context['id']
        )

        transport = TTransport.TMemoryBuffer()

        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        data.write(protocol)

        print(data)
        #print(transport._buffer.getvalue())

        publisher.publish(topic_path, transport._buffer.getvalue())


def write_data_to_snowplow_if_configured(events: EventDataList) -> None:
    """
    Write data to Snowplow
    :param events: events to write
    """

    write_data_to_pubsub(events)

    url = 'http://34.107.238.153/com.snowplowanalytics.snowplow/tp2'
    headers = {
        'Content-Type': 'application/json; charset=UTF-8'
    }

    payload = {
        "schema": "iglu:com.snowplowanalytics.snowplow/payload_data/jsonschema/1-0-4",
        "data": []
    }

    for event in events:
        try:
            cookie_context = get_context(event, 'CookieIdContext')
        except ValueError:
            cookie_context = {'id': None}

        try:
            http_context = get_context(event, 'HttpContext')
        except ValueError:
            print(json.dumps(event, indent=4))
            http_context = {
                'user_agent': ''
            }
        try:
            path_context = get_context(event, 'PathContext')
        except ValueError:
            path_context = {'id': ''}

        headers['User-Agent'] = http_context['user_agent']
        snowplow_event = objectiv_event_to_snowplow(event)
        snowplow_custom_context = make_snowplow_custom_context(snowplow_event)
        payload["data"].append({
                    "e": "se",  # mandatory: event type: unstructured event
                    "p": "web",  # mandatory: platform
                    "tv": "objectiv-tracker-0.0.5",  # mandatory: tracker version
                    "eid": event['id'],
                    "url": path_context['id'],
                    "nuid": cookie_context['id'],
                    "cx": snowplow_custom_context})

    print(f'sending payload: {json.dumps(payload, indent=4)}')

    x = requests.post(url, json=payload, headers=headers)
    print(x)
    print(x.headers)

