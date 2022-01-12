"""
Copyright 2021 Objectiv B.V.
"""

# Any import from from bach_open_taxonomy initializes all the types, do not remove
from bach_open_taxonomy import __version__
from tests_bach_open_taxonomy.functional.objectiv_bach.data_and_utils import get_objectiv_frame
from tests.functional.bach.test_data_and_utils import assert_equals_data
from uuid import UUID


def test_get_objectiv_stack():
    get_objectiv_frame()

def test_objectiv_frame_unique_users():
    df = get_objectiv_frame()
    bts = df.model_hub.aggregate.unique_users()

    assert_equals_data(
        bts,
        expected_columns=['unique_users'],
        expected_data=[
            [4]
        ]
    )
    # using time_aggregation
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')
    bts = df.model_hub.aggregate.unique_users()

    assert_equals_data(
        bts,
        expected_columns=['moment', 'unique_users'],
        expected_data=[
            ['2021-11-29', 1],
            ['2021-11-30', 2],
            ['2021-12-01', 1],
            ['2021-12-02', 1],
            ['2021-12-03', 1]
        ]
    )

def test_objectiv_frame_unique_sessions():
    df = get_objectiv_frame()
    bts = df.model_hub.aggregate.unique_sessions()

    assert_equals_data(
        bts,
        expected_columns=['unique_sessions'],
        expected_data=[
            [7]
        ]
    )
    # using time_aggregation
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')
    bts = df.model_hub.aggregate.unique_sessions()

    assert_equals_data(
        bts,
        expected_columns=['moment', 'unique_sessions'],
        expected_data=[
            ['2021-11-29', 1], ['2021-11-30', 2], ['2021-12-01', 1], ['2021-12-02', 2], ['2021-12-03', 1]
        ]
    )


def test_objectiv_frame_filters():
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')
    is_first_session = df.mh.map.is_first_session()

    assert_equals_data(
        is_first_session,
        expected_columns=['user_id', 'is_first_session'],
        expected_data=[
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b1'), True],
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b1'), False],
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b1'), False],
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b2'), True],
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b2'), True],
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b2'), False],
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b2'), False],
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b2'), False],
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b3'), True],
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b3'), True],
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b3'), False],
            [UUID('b2df75d2-d7ca-48ac-9747-af47d7a4a2b4'), True]
        ]
    )

    bts = df.mh.agg.unique_users(filter=is_first_session)

    assert_equals_data(
        bts,
        expected_columns=['moment', 'unique_users_is_first_session'],
        expected_data=[['2021-11-29', 1], ['2021-11-30', 1], ['2021-12-02', 1], ['2021-12-03', 1]]
    )


def test_objectiv_conversion_events():
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')
    # add conversion event
    df.add_conversion_event(location_stack=df.location_stack.json[{'_type': 'LinkContext', 'id': 'cta-repo-button'}:],
                            event_type='ClickEvent',
                            name='github_clicks')
    conversion_event = df.mh.map.is_conversion('github_clicks')

    assert_equals_data(
        conversion_event,
        expected_columns=['event_id', 'conversion'],
        expected_data=[
            [UUID('18aa35ae-a336-4429-8ecb-0eb0a255d3ed'), False],
            [UUID('6613043e-0a76-4ed4-8644-a217b0646945'), False],
            [UUID('da7ffae3-6426-4e00-a8e5-a4186c35ed8c'), False],
            [UUID('8d111c76-f704-4128-939d-9509170310c9'), False],
            [UUID('2fd7c5b0-c294-4b7d-b21b-4172853b879d'), False],
            [UUID('18630b83-cdbe-4be8-b896-6998f4566c3e'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac3da'), False],
            [UUID('4e4f5564-0e0c-4403-a711-9c967252a903'), False],
            [UUID('8b9292f4-08d2-4352-8745-6b1d829bf52f'), False],
            [UUID('f61d19db-00d8-4af4-ac8c-e21a7b39704f'), False],
            [UUID('e06a0811-b12e-40f7-beda-161d5e720320'), False],
            [UUID('c1f24ade-1eea-42e5-8dee-a7584f9acd0a'), False]
        ]
    )

    bts = df.mh.agg.unique_users(filter=conversion_event)

    assert_equals_data(
        bts,
        expected_columns=['moment', 'unique_users_conversion'],
        expected_data=[['2021-11-30', 1]]
    )
