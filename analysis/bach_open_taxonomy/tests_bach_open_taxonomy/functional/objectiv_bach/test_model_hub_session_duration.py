"""
Copyright 2021 Objectiv B.V.
"""

# Any import from from bach_open_taxonomy initializes all the types, do not remove
from bach_open_taxonomy import __version__
import pytest
from tests_bach_open_taxonomy.functional.objectiv_bach.data_and_utils import get_objectiv_frame
from tests.functional.bach.test_data_and_utils import assert_equals_data
import datetime


def test_defaults():
    # setting nothing, thus using all defaults (which is just moment without formatting)
    df = get_objectiv_frame()
    s = df.model_hub.aggregate.session_duration()

    # with standard time_aggregation, all sessions are bounces
    assert len(s.to_numpy()) == 0

@pytest.mark.parametrize("exclude_bounces,expected_data", [
    (True, [[datetime.timedelta(microseconds=2667)]]),
    (False, [[datetime.timedelta(microseconds=1143)]])
])
def test_no_grouping(exclude_bounces, expected_data):
    # not grouping to anything
    df = get_objectiv_frame()
    s = df.model_hub.aggregate.session_duration(groupby=None, exclude_bounces=exclude_bounces)

    assert_equals_data(
        s,
        expected_columns=['session_duration'],
        expected_data=expected_data
    )

def test_time_aggregation_in_df():
    # using time_aggregation (and default groupby: mh.time_agg())
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')
    s = df.model_hub.aggregate.session_duration()

    assert_equals_data(
        s,
        expected_columns=['time_aggregation', 'session_duration'],
        expected_data=[
            ['2021-11-29', datetime.timedelta(microseconds=1000)],
            ['2021-11-30', datetime.timedelta(microseconds=4000)],
            ['2021-12-01', datetime.timedelta(microseconds=3000)]
        ]
    )

def test_overriding_time_aggregation_in():
    # overriding time_aggregation
    df = get_objectiv_frame()
    bts = df.model_hub.aggregate.session_duration(groupby=df.mh.time_agg('YYYY-MM'))

    assert_equals_data(
        bts,
        expected_columns=['time_aggregation', 'session_duration'],
        expected_data=[['2021-11', datetime.timedelta(microseconds=2500)],
            ['2021-12', datetime.timedelta(microseconds=3000)]]
    )

def test_groupby():
    # group by other columns
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')
    s = df.model_hub.aggregate.session_duration(groupby='event_type')

    assert_equals_data(
        s,
        expected_columns=['event_type', 'session_duration'],
        expected_data=[['ClickEvent', datetime.timedelta(microseconds=2667)]]
    )

def test_groupby_incl_time_agg():
    # group by other columns (as series), including time_agg
    df = get_objectiv_frame(time_aggregation='YYYY-MM-DD')
    s = df.model_hub.aggregate.session_duration(groupby=[df.mh.time_agg('YYYY-MM'), df.session_id])

    assert_equals_data(
        s,
        expected_columns=['time_aggregation', 'session_id', 'session_duration'],
        expected_data=[
            ['2021-11', 1, datetime.timedelta(microseconds=1000)],
            ['2021-11', 3, datetime.timedelta(microseconds=4000)],
            ['2021-12', 4, datetime.timedelta(microseconds=3000)]
        ]
    )
