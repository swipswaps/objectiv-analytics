import json
import base64
from objectiv_backend.snowplow.schema.ttypes import CollectorPayload
from objectiv_backend.snowplow.snowplow_helper import make_snowplow_custom_context, \
    objectiv_event_to_snowplow, objectiv_event_to_snowplow_payload
from tests.schema.test_schema import CLICK_EVENT_JSON, make_event_from_dict
from objectiv_backend.common.config import SnowplowConfig


config = SnowplowConfig(
    schema_contexts='test-schema-contexts',
    schema_payload_data='test-schema-payload-data',
    schema_objectiv_taxonomy='test-schema-objectiv-taxonomy',
    schema_collector_payload='',
    gcp_project='',
    gcp_pubsub_topic_raw=''
)

event_list = json.loads(CLICK_EVENT_JSON)
event = make_event_from_dict(event_list['events'][0])


def test_objectiv_event_to_snowplow():

    sp_event = objectiv_event_to_snowplow(event=event, config=config)
    assert type(sp_event) == dict

    assert sp_event['schema'] == config.schema_objectiv_taxonomy
    assert sp_event['data'] == event


def test_make_snowplow_custom_context():
    sp_event = objectiv_event_to_snowplow(event=event, config=config)
    encoded_context = make_snowplow_custom_context(snowplow_event=sp_event, config=config)

    json_context = base64.b64decode(encoded_context)
    context = json.loads(json_context)

    # check that this is in fact a context conforming to the contexts schema we set
    assert context['schema'] == config.schema_contexts

    assert context['data'][0]
    context_data = context['data'][0]
    # check we can find the original objectiv event inside of it
    assert context_data['schema'] == config.schema_objectiv_taxonomy

    # check to see the data is still the same as the original event
    assert context_data['data'] == event


def test_objectiv_event_to_snowplow_payload():

    collector_payload = objectiv_event_to_snowplow_payload(event=event, config=config)
    # check iof we get ther proper object
    assert type(collector_payload) == CollectorPayload

    # check if the schema is correct
    assert collector_payload.schema == config.schema_collector_payload

    body = json.loads(collector_payload.body)
    # check the schema of the body attribute
    assert body['schema'] == config.schema_payload_data

    # check if we can deserialize the encoded custom context properly
    assert json.loads(base64.b64decode(body['data'][0]['cx']))
