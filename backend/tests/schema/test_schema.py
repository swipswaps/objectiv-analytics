
from objectiv_backend.schema.schema import make_event_from_dict, ContentContext, HttpContext, make_context
import json
from typing import Dict, Any
from objectiv_backend.common.event_utils import add_global_context_to_event, get_context, get_contexts

from objectiv_backend.schema.validate_events import validate_structure_event_list, validate_event_adheres_to_schema
from objectiv_backend.common.config import get_collector_config
from objectiv_backend.end_points.collector import add_http_context_to_event


CLICK_EVENT_JSON = '''
{
    "events":[
        {
            "_type":"PressEvent",
            "location_stack":[
                {
                    "_type":"RootLocationContext",
                    "id":"home"
                },{
                    "_type":"NavigationContext",
                    "id":"navigation"
                },{
                    "_type":"PressableContext",
                    "id":"open-drawer"
                }
            ],
            "global_contexts":[
                {
                    "_type":"ApplicationContext",
                    "id":"rod-web-demo"
                },
                {
                    "_type":"PathContext",
                    "id":"http://localhost:3000/"
                }
            ],
            "time":1630049334860,
            "id":"d8b0f1ca-4ebe-45b6-b7fb-7858cf46082a"
        }
    ],
    "transport_time":1630049335313
}
'''

EVENT_SCHEMA = get_collector_config().event_schema


class Request(object):
    headers = {
        'Referer': 'test-referer',
        'User-Agent': 'test-user-agent',
        'X-Real-IP': '256.256.256.256'
    }


HTTP_REQUEST = Request()


def order_dict(dictionary: Dict[str, Any]) -> Dict[str, Any]:
    result = {}
    for key, value in sorted(dictionary.items()):
        if isinstance(value, dict):
            result[key] = order_dict(value)
        elif isinstance(value, list):
            result[key] = [order_dict(i) if isinstance(i, dict) else i for i in value]
        else:
            result[key] = value
    return result


def test_make_event_from_dict():
    event_list = json.loads(CLICK_EVENT_JSON)
    event_json = event_list['events'][0]
    sorted_event_json = order_dict(event_json)

    event = make_event_from_dict(event_json)
    sorted_event = order_dict(event)

    # check resulting event is the same as input event
    assert(json.dumps(sorted_event) == json.dumps(sorted_event_json))

    event_schema = get_collector_config().event_schema

    # check it still validates, eg, returned list of errors is empty
    assert(validate_structure_event_list([event]) == [])
    assert (validate_event_adheres_to_schema(event_schema=event_schema, event=event) == [])

    # check validation actually fails if a required property `time` is not there
    del event['time']

    assert (validate_structure_event_list([event]) == [])
    assert(validate_event_adheres_to_schema(event_schema=event_schema, event=event) != [])


def test_make_content_context():
    content_context = {
        'id': 'content_id',
        '_type': 'ContentContext'
    }

    context = ContentContext(**content_context)
    # check dictionaries are the same
    assert(context == content_context)
    # check json serialized versions are the same
    assert(json.dumps(context) == json.dumps(content_context))


def test_add_global_context():

    context_vars = {
        '_type': 'HttpContext',
        'id': 'test-http-context-id',
        'referer': 'test-referer',
        'remote_address': 'test-address',
        'user_agent': 'test-user_agent'
    }
    context = make_context(**context_vars)

    # check if we've created a proper HttpContext Object
    assert isinstance(context, HttpContext)

    # add created context to event
    event_list = json.loads(CLICK_EVENT_JSON)
    event = make_event_from_dict(event_list['events'][0])
    add_global_context_to_event(event, context)

    # check if event is still valid
    assert(validate_structure_event_list([event]) == [])

    # check if it's there, and holds the proper values
    generated_context = get_context(event, 'HttpContext')
    assert generated_context == context_vars


def test_add_context_to_incorrect_scope():
    context_vars = {
        '_type': 'HttpContext',
        'id': 'test-http-context-id',
        'referer': 'test-referer',
        'remote_address': 'test-address',
        'user_agent': 'test-user_agent'
    }
    context = make_context(**context_vars)

    # check if we've created a proper HttpContext Object
    assert isinstance(context, HttpContext)

    # add created context to event
    event_list = json.loads(CLICK_EVENT_JSON)
    event = make_event_from_dict(event_list['events'][0])

    # check event is valid to start with
    event_schema = get_collector_config().event_schema
    assert(validate_event_adheres_to_schema(event_schema=event_schema, event=event) == [])

    # manually add it, to circumvent type checking
    event['location_stack'].append(context)

    # check if event is still valid
    assert(validate_structure_event_list([event]) == [])

    # check if event is not valid anymore
    assert(validate_event_adheres_to_schema(event_schema=event_schema, event=event) != [])


def _get_http_context():
    headers = HTTP_REQUEST.headers
    return {
        '_type': 'HttpContext',
        'id': 'http_context',
        'remote_address': headers['X-Real-IP'],
        'referer': headers['Referer'],
        'user_agent': headers['User-Agent']
    }


def test_add_create_http_context():
    """
    Test that an http context is succesfully added by the collector, if none is present
    """
    event_list = json.loads(CLICK_EVENT_JSON)
    event = make_event_from_dict(event_list['events'][0])
    add_http_context_to_event(event=event, request=HTTP_REQUEST)

    generated_http_contexts = get_contexts(event=event, context_type='HttpContext')

    # will be false if there is none
    assert generated_http_contexts

    # there should be exactly 1 HttpContext
    assert len(generated_http_contexts) == 1

    generated_http_context = generated_http_contexts[0]

    assert(order_dict(generated_http_context) == order_dict(_get_http_context()))


def test_enrich_http_context():
    """
    Test that an http context is successfully enriched by the collector, if one is already present
    """

    event_list = json.loads(CLICK_EVENT_JSON)
    event = make_event_from_dict(event_list['events'][0])

    headers = HTTP_REQUEST.headers
    http_context = {
        '_type': 'HttpContext',
        'id': 'http_context',
        'remote_address': '127.0.0.1',
        'referer': headers['Referer'],
        'user_agent': headers['User-Agent']
    }
    # add context to event
    add_global_context_to_event(event=event, context=http_context)

    # this should enrich the pre-existing HttpContext
    add_http_context_to_event(event=event, request=HTTP_REQUEST)

    # retrieve http context(s) from event
    generated_http_contexts = get_contexts(event=event, context_type='HttpContext')

    # will be false if there is none
    assert generated_http_contexts

    # there should be exactly 1 HttpContext
    assert len(generated_http_contexts) == 1

    generated_http_context = generated_http_contexts[0]

    assert(order_dict(generated_http_context) == order_dict(_get_http_context()))
