"""
Copyright 2021 Objectiv B.V.
"""

# Any import from from bach_open_taxonomy initializes all the types, do not remove
from bach_open_taxonomy import __version__
from tests_bach_open_taxonomy.functional.objectiv_bach.data_and_utils import get_objectiv_frame
from tests.functional.bach.test_data_and_utils import assert_equals_data
from uuid import UUID
import datetime


def test_get_objectiv_stack():
    get_objectiv_frame()


# map
def test_is_first_session():
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')

    s = df.mh.map.is_first_session()

    assert_equals_data(
        s,
        expected_columns=['event_id', 'is_first_session'],
        expected_data=[
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac301'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac302'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac303'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac304'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac305'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac306'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac307'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac308'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac309'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac310'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac311'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac312'), True]
        ],
        order_by='event_id'
    )


def test_is_new_user():
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')

    s = df.mh.map.is_new_user()

    assert_equals_data(
        s,
        expected_columns=['event_id', 'is_new_user'],
        expected_data=[
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac301'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac302'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac303'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac304'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac305'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac306'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac307'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac308'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac309'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac310'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac311'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac312'), True]
        ],
        order_by='event_id'
    )


def test_is_conversion_event():
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')
    # add conversion event
    df.add_conversion_event(location_stack=df.location_stack.json[{'_type': 'LinkContext', 'id': 'cta-repo-button'}:],
                            event_type='ClickEvent',
                            name='github_clicks')
    s = df.mh.map.is_conversion_event('github_clicks')

    assert_equals_data(
        s,
        expected_columns=['event_id', 'is_conversion_event'],
        expected_data=[
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac301'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac302'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac303'), True],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac304'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac305'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac306'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac307'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac308'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac309'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac310'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac311'), False],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac312'), False]
        ],
        order_by='event_id'
    )


def test_conversion_count():
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')
    # add conversion event
    df.add_conversion_event(location_stack=df.location_stack.json[{'_type': 'LinkContext', 'id': 'cta-repo-button'}:],
                            event_type='ClickEvent',
                            name='github_clicks')
    s = df.mh.map.conversions_in_time('github_clicks')

    assert_equals_data(
        s,
        expected_columns=['event_id', 'conversion_count'],
        expected_data=[
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac301'), 0],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac302'), 0],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac303'), 1],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac304'), 0],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac305'), 0],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac306'), 0],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac307'), 0],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac308'), 0],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac309'), 0],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac310'), 0],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac311'), 0],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac312'), 0]
        ],
        order_by='event_id'
    )


def test_pre_conversion_hit_number():
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')
    # add conversion event
    df.add_conversion_event(location_stack=df.location_stack.json[{'_type': 'LinkContext', 'id': 'cta-repo-button'}:],
                            event_type='ClickEvent',
                            name='github_clicks')
    s = df.mh.map.pre_conversion_hit_number('github_clicks')

    assert_equals_data(
        s,
        expected_columns=['event_id', 'pre_conversion_hit_number'],
        expected_data=[
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac301'), 2],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac302'), 1],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac303'), None],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac304'), None],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac305'), None],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac306'), None],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac307'), None],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac308'), None],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac309'), None],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac310'), None],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac311'), None],
            [UUID('12b55ed5-4295-4fc1-bf1f-88d64d1ac312'), None]
        ],
        order_by='event_id'
    )


# aggregate
def test_unique_users():
    df = get_objectiv_frame()
    s = df.model_hub.aggregate.unique_users()

    assert_equals_data(
        s,
        expected_columns=['unique_users'],
        expected_data=[
            [4]
        ]
    )
    # using time_aggregation
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')
    s = df.model_hub.aggregate.unique_users()

    assert_equals_data(
        s,
        expected_columns=['moment', 'unique_users'],
        expected_data=[
            ['2021-11-29', 1],
            ['2021-11-30', 2],
            ['2021-12-01', 1],
            ['2021-12-02', 1],
            ['2021-12-03', 1]
        ]
    )


def test_unique_sessions():
    df = get_objectiv_frame()
    s = df.model_hub.aggregate.unique_sessions()

    assert_equals_data(
        s,
        expected_columns=['unique_sessions'],
        expected_data=[
            [7]
        ]
    )
    # using time_aggregation
    df = get_objectiv_frame(time_aggregation='YYYY-MM')
    s = df.model_hub.aggregate.unique_sessions()

    assert_equals_data(
        s,
        expected_columns=['moment', 'unique_sessions'],
        expected_data=[
            ['2021-11', 3],
            ['2021-12', 4]
        ]
    )


def test_session_duration():
    df = get_objectiv_frame()
    s = df.model_hub.aggregate.session_duration()

    assert_equals_data(
        s,
        expected_columns=['session_duration'],
        expected_data=[
            [datetime.timedelta(microseconds=2667)]
        ]
    )
    # using time_aggregation
    df = get_objectiv_frame()
    bts = df.model_hub.aggregate.session_duration(time_aggregation='YYYY-MM-DD')

    assert_equals_data(
        bts,
        expected_columns=['moment', 'session_duration'],
        expected_data=[
            ['2021-11-29', datetime.timedelta(microseconds=1000)],
            ['2021-11-30', datetime.timedelta(microseconds=4000)],
            ['2021-12-01', datetime.timedelta(microseconds=3000)]
        ]
    )


def test_frequency():
    df = get_objectiv_frame()
    s = df.model_hub.aggregate.frequency()

    assert_equals_data(
        s,
        expected_columns=['session_id_nunique', 'user_id_nunique'],
        expected_data=[
            [1, 1],
            [2, 3]
        ]
    )