import json

from objectiv_backend.end_points.collector import add_http_context_to_event, add_marketing_context_to_event
from objectiv_backend.common.event_utils import add_global_context_to_event, get_contexts
from tests.schema.test_schema import CLICK_EVENT_JSON, make_event_from_dict, order_dict


class Request(object):
    headers = {
        'Referer': 'test-referer',
        'User-Agent': 'test-user-agent',
        'X-Real-IP': '256.256.256.256'
    }


HTTP_REQUEST = Request()


def _get_http_context():
    headers = HTTP_REQUEST.headers
    return {
        '_type': 'HttpContext',
        'id': 'http_context',
        'remote_address': headers['X-Real-IP'],
        'referrer': headers['Referer'],
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
        'referrer': headers['Referer'],
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


def test_enrich_marketing_context():
    event_list = json.loads(CLICK_EVENT_JSON)
    event = make_event_from_dict(event_list['events'][0])

    add_marketing_context_to_event(event=event)

    # there are no utm parameters
    generated_marketing_contexts = get_contexts(event=event, context_type='MarketingContext')
    assert len(generated_marketing_contexts) == 0

    # update path context, with utm params in query string
    path_contexts = get_contexts(event=event, context_type='PathContext')
    path_context = path_contexts[0]

    path_context['id'] = 'http://localhost:3000?' \
                         'utm_source=test-source&utm_medium=test-medium&utm_campaign=test-campaign'

    # call enrichment
    add_marketing_context_to_event(event=event)

    # there should now be exactly one marketing context
    generated_marketing_contexts = get_contexts(event=event, context_type='MarketingContext')
    assert len(generated_marketing_contexts) == 1
