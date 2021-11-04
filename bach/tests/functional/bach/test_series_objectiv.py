"""
Copyright 2021 Objectiv B.V.
"""
import pytest

from bach.types import TypeRegistry
from bach.series.series_objectiv import SeriesGlobalContexts, SeriesLocationStack
from tests.functional.bach.test_data_and_utils import  get_bt_with_json_data_real, assert_equals_data


def test_get_real_data():
    bt = get_bt_with_json_data_real()
    assert_equals_data(
        bt,
        expected_columns=['_index_event_id', 'event_id', 'global_contexts', 'location_stack'],
        expected_data=[
            [1, 1, [{'id': 'rod-web-demo', '_type': 'ApplicationContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'ApplicationContext']},
                    {'id': 'device', '_type': 'DeviceContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'DeviceContext'],
                     'user_agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0'},
                    {'id': 'http_context', 'host': 'collector.objectiv.io', '_type': 'HttpContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'HttpContext'],
                     'origin': 'https://rick.objectiv.io', 'referer': 'https://rick.objectiv.io/',
                     'user_agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
                     'remote_addr': '172.20.0.2', 'remote_address': '86.86.89.85', 'x_forwarded_for': '86.86.89.85'},
                    {'id': 'f84446c6-eb76-4458-8ef4-93ade596fd5b', '_type': 'CookieIdContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'CookieIdContext'],
                     'cookie_id': 'f84446c6-eb76-4458-8ef4-93ade596fd5b'}], [
                 {'id': '#document', 'url': 'https://rick.objectiv.io/', '_type': 'WebDocumentContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext', 'WebDocumentContext']},
                 {'id': 'home', '_type': 'SectionContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext']},
                 {'id': 'yep', '_type': 'SectionContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext']},
                 {'id': 'ZVshSddRqAc', '_type': 'ItemContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'ItemContext']}]],
            [2, 2, [{'id': 'rod-web-demo', '_type': 'ApplicationContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'ApplicationContext']},
                    {'id': 'device', '_type': 'DeviceContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'DeviceContext'],
                     'user_agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0'},
                    {'id': 'http_context', 'host': 'collector.objectiv.io', '_type': 'HttpContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'HttpContext'],
                     'origin': 'https://rick.objectiv.io', 'referer': 'https://rick.objectiv.io/',
                     'user_agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
                     'remote_addr': '172.20.0.2', 'remote_address': '86.86.89.85', 'x_forwarded_for': '86.86.89.85'},
                    {'id': 'f84446c6-eb76-4458-8ef4-93ade596fd5b', '_type': 'CookieIdContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'CookieIdContext'],
                     'cookie_id': 'f84446c6-eb76-4458-8ef4-93ade596fd5b'}], [
                 {'id': '#document', 'url': 'https://rick.objectiv.io/', '_type': 'WebDocumentContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext', 'WebDocumentContext']},
                 {'id': 'home', '_type': 'SectionContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext']}]],
            [3, 3, [{'id': 'rod-web-demo', '_type': 'ApplicationContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'ApplicationContext']},
                    {'id': 'device', '_type': 'DeviceContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'DeviceContext'],
                     'user_agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0'},
                    {'id': 'http_context', 'host': 'collector.objectiv.io', '_type': 'HttpContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'HttpContext'],
                     'origin': 'https://rick.objectiv.io', 'referer': 'https://rick.objectiv.io/',
                     'user_agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
                     'remote_addr': '172.20.0.2', 'remote_address': '86.86.89.85', 'x_forwarded_for': '86.86.89.85'},
                    {'id': 'f84446c6-eb76-4458-8ef4-93ade596fd5b', '_type': 'CookieIdContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'CookieIdContext'],
                     'cookie_id': 'f84446c6-eb76-4458-8ef4-93ade596fd5b'}], [
                 {'id': '#document', 'url': 'https://rick.objectiv.io/', '_type': 'WebDocumentContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext', 'WebDocumentContext']},
                 {'id': 'home', '_type': 'SectionContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext']},
                 {'id': 'new', '_type': 'SectionContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext']},
                 {'id': '5o7WEv5Q5ZE', '_type': 'ItemContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'ItemContext']}]],
            [4, 4, [{'id': 'rod-web-demo', '_type': 'ApplicationContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'ApplicationContext']},
                    {'id': 'device', '_type': 'DeviceContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'DeviceContext'],
                     'user_agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0'},
                    {'id': 'http_context', 'host': 'collector.objectiv.io', '_type': 'HttpContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'HttpContext'],
                     'origin': 'https://rick.objectiv.io', 'referer': 'https://rick.objectiv.io/',
                     'user_agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
                     'remote_addr': '172.20.0.2', 'remote_address': '86.86.89.85', 'x_forwarded_for': '86.86.89.85'},
                    {'id': 'f84446c6-eb76-4458-8ef4-93ade596fd5b', '_type': 'CookieIdContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'CookieIdContext'],
                     'cookie_id': 'f84446c6-eb76-4458-8ef4-93ade596fd5b'}], [
                 {'id': '#document', 'url': 'https://rick.objectiv.io/', '_type': 'WebDocumentContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext', 'WebDocumentContext']},
                 {'id': 'home', '_type': 'SectionContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext']},
                 {'id': 'for-you', '_type': 'SectionContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext']},
                 {'id': 'cc91EfoBh8A', '_type': 'ItemContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'ItemContext']}]],
            [5, 5, [{'id': 'rod-web-demo', '_type': 'ApplicationContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'ApplicationContext']},
                    {'id': 'device', '_type': 'DeviceContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'DeviceContext'],
                     'user_agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0'},
                    {'id': 'http_context', 'host': 'collector.objectiv.io', '_type': 'HttpContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'HttpContext'],
                     'origin': 'https://rick.objectiv.io', 'referer': 'https://rick.objectiv.io/',
                     'user_agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
                     'remote_addr': '172.20.0.2', 'remote_address': '86.86.89.85', 'x_forwarded_for': '86.86.89.85'},
                    {'id': 'f84446c6-eb76-4458-8ef4-93ade596fd5b', '_type': 'CookieIdContext',
                     '_types': ['AbstractContext', 'AbstractGlobalContext', 'CookieIdContext'],
                     'cookie_id': 'f84446c6-eb76-4458-8ef4-93ade596fd5b'}], [
                 {'id': '#document', 'url': 'https://rick.objectiv.io/', '_type': 'WebDocumentContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext', 'WebDocumentContext']},
                 {'id': 'home', '_type': 'SectionContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext']},
                 {'id': 'new', '_type': 'SectionContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'SectionContext']},
                 {'id': 'yPYZpwSpKmA', '_type': 'ItemContext',
                  '_types': ['AbstractContext', 'AbstractLocationContext', 'ItemContext']}]]
        ]
    )

def test_objectiv_stack_type(monkeypatch):
    # make sure monkeypatch the type-registry, as it should be restored after this test finishes.
    monkeypatch.setattr('bach.types._registry', TypeRegistry())

    from bach.types import _registry
    _registry.register_dtype_series(SeriesGlobalContexts, [], override_registered_types=True)
    _registry.register_dtype_series(SeriesLocationStack, [], override_registered_types=True)

    bt = get_bt_with_json_data_real()

    bt['a'] = bt.global_contexts.astype('objectiv_global_context')
    bts = bt.a.objectiv.get_from_context_with_type_series("CookieIdContext", "cookie_id")
    assert_equals_data(
        bts,
        expected_columns=['_index_event_id', 'a'],
        expected_data=[
            [1, 'f84446c6-eb76-4458-8ef4-93ade596fd5b'],
            [2, 'f84446c6-eb76-4458-8ef4-93ade596fd5b'],
            [3, 'f84446c6-eb76-4458-8ef4-93ade596fd5b'],
            [4, 'f84446c6-eb76-4458-8ef4-93ade596fd5b'],
            [5, 'f84446c6-eb76-4458-8ef4-93ade596fd5b']
        ]
    )

def test_objectiv_stack_type2(monkeypatch):
    # make sure monkeypatch the type-registry, as it should be restored after this test finishes.
    monkeypatch.setattr('bach.types._registry', TypeRegistry())

    from bach.types import _registry
    _registry.register_dtype_series(SeriesGlobalContexts, [], override_registered_types=True)
    _registry.register_dtype_series(SeriesLocationStack, [], override_registered_types=True)

    bt = get_bt_with_json_data_real()

    bt['a'] = bt.global_contexts.astype('objectiv_global_context')
    bts = bt.a.global_contexts.user_agent
    assert_equals_data(
        bts,
        expected_columns=['_index_event_id', 'a'],
        expected_data=[
            [1, 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0'],
            [2, 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0'],
            [3, 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0'],
            [4, 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0'],
            [5, 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0']
        ]
    )

def test_objectiv_stack_type3(monkeypatch):
    # make sure monkeypatch the type-registry, as it should be restored after this test finishes.
    monkeypatch.setattr('bach.types._registry', TypeRegistry())

    from bach.types import _registry
    _registry.register_dtype_series(SeriesGlobalContexts, [], override_registered_types=True)
    _registry.register_dtype_series(SeriesLocationStack, [], override_registered_types=True)

    bt = get_bt_with_json_data_real()

    bt['b'] = bt.location_stack.astype('objectiv_location_stack')
    bts = bt.b.location_stack.navigation_features
    assert_equals_data(
        bts,
        expected_columns=['_index_event_id', 'b'],
        expected_data=[
            [1, None],
            [2, None],
            [3, None],
            [4, None],
            [5, None]
        ]
    )

def test_objectiv_stack_type4(monkeypatch):
    # make sure monkeypatch the type-registry, as it should be restored after this test finishes.
    monkeypatch.setattr('bach.types._registry', TypeRegistry())

    from bach.types import _registry
    _registry.register_dtype_series(SeriesGlobalContexts, [], override_registered_types=True)
    _registry.register_dtype_series(SeriesLocationStack, [], override_registered_types=True)

    bt = get_bt_with_json_data_real()

    bt['b'] = bt.location_stack.astype('objectiv_location_stack')
    bts = bt.b.location_stack.feature_stack
    assert_equals_data(
        bts,
        expected_columns=['_index_event_id', 'b'],
        expected_data=[
            [1, [{'id': '#document', '_type': 'WebDocumentContext'}, {'id': 'home', '_type': 'SectionContext'}, {'id': 'yep', '_type': 'SectionContext'}, {'id': 'ZVshSddRqAc', '_type': 'ItemContext'}]],
            [2, [{'id': '#document', '_type': 'WebDocumentContext'}, {'id': 'home', '_type': 'SectionContext'}]],
            [3, [{'id': '#document', '_type': 'WebDocumentContext'}, {'id': 'home', '_type': 'SectionContext'}, {'id': 'new', '_type': 'SectionContext'}, {'id': '5o7WEv5Q5ZE', '_type': 'ItemContext'}]],
            [4, [{'id': '#document', '_type': 'WebDocumentContext'}, {'id': 'home', '_type': 'SectionContext'}, {'id': 'for-you', '_type': 'SectionContext'}, {'id': 'cc91EfoBh8A', '_type': 'ItemContext'}]],
            [5, [{'id': '#document', '_type': 'WebDocumentContext'}, {'id': 'home', '_type': 'SectionContext'}, {'id': 'new', '_type': 'SectionContext'}, {'id': 'yPYZpwSpKmA', '_type': 'ItemContext'}]]
        ]
    )

def test_objectiv_stack_type5(monkeypatch):
    # make sure monkeypatch the type-registry, as it should be restored after this test finishes.
    monkeypatch.setattr('bach.types._registry', TypeRegistry())

    from bach.types import _registry
    _registry.register_dtype_series(SeriesGlobalContexts, [], override_registered_types=True)
    _registry.register_dtype_series(SeriesLocationStack, [], override_registered_types=True)

    bt = get_bt_with_json_data_real()

    bt['b'] = bt.location_stack.astype('objectiv_location_stack')
    bts = bt.b.location_stack.nice_name
    assert_equals_data(
        bts,
        expected_columns=['_index_event_id', 'b'],
        expected_data=[
            [1, 'Item: ZVshSddRqAc located at Web Document: #document => Section: home => Section: yep'],
            [2, 'Section: home located at Web Document: #document'],
            [3, 'Item: 5o7WEv5Q5ZE located at Web Document: #document => Section: home => Section: new'],
            [4, 'Item: cc91EfoBh8A located at Web Document: #document => Section: home => Section: for-you'],
            [5, 'Item: yPYZpwSpKmA located at Web Document: #document => Section: home => Section: new']
        ]
    )
