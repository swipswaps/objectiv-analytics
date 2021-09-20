"""
Copyright 2021 Objectiv B.V.
"""
from typing import List

import pytest

from buhtuh import BuhTuhDataFrame, BuhTuhSeriesInt64
from buhtuh.merge import _determine_left_on_right_on


def test__determine_left_on_right_on_simple_df_df_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    assert call__determine_left_on_right_on(left, right) == (['c'], ['c'])


def test__determine_left_on_right_on_simple_df_df_non_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['d', 'e'])
    with pytest.raises(ValueError):
        # TODO: should we match on index in this case? That seems to make sense
        # there are no columns in left and right with the same name
        call__determine_left_on_right_on(left, right)


def test__determine_left_on_right_on_on_df_df_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    assert call__determine_left_on_right_on(left, right, on='c') == (['c'], ['c'])
    assert call__determine_left_on_right_on(left, right, on=['c']) == (['c'], ['c'])
    assert call__determine_left_on_right_on(left, right, on='a') == (['a'], ['a'])
    assert call__determine_left_on_right_on(left, right, on=['a']) == (['a'], ['a'])
    assert call__determine_left_on_right_on(left, right, on=['a', 'c']) == (['a', 'c'], ['a', 'c'])


def test__determine_left_on_right_on_on_df_df_non_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    with pytest.raises(ValueError):
        # 'x' does not exist in either of the dfs
        call__determine_left_on_right_on(left, right, on='x')
    with pytest.raises(ValueError):
        # 'b' does not exist in the right df
        call__determine_left_on_right_on(left, right, on='b')
    with pytest.raises(ValueError):
        # 'd' does not exist in the left df
        call__determine_left_on_right_on(left, right, on='d')


def test__determine_left_on_right_on_left_on_right_on_df_df_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    assert call__determine_left_on_right_on(left, right, left_on='c', right_on='c') == (['c'], ['c'])
    assert call__determine_left_on_right_on(left, right, left_on=['c'], right_on='c') == (['c'], ['c'])
    assert call__determine_left_on_right_on(left, right, left_on='c', right_on=['c']) == (['c'], ['c'])
    assert call__determine_left_on_right_on(left, right, left_on='a', right_on='a') == (['a'], ['a'])
    assert call__determine_left_on_right_on(left, right, left_on=['a'], right_on=['a']) == (['a'], ['a'])
    assert call__determine_left_on_right_on(left, right, left_on=['a', 'c'], right_on=['a', 'c']) \
           == (['a', 'c'], ['a', 'c'])
    assert call__determine_left_on_right_on(left, right, left_on=['a'], right_on=['c']) == (['a'], ['c'])
    assert call__determine_left_on_right_on(left, right, left_on=['a', 'b'], right_on=['a', 'd']) \
           == (['a', 'b'], ['a', 'd'])


def test__determine_left_on_right_on_left_on_right_on_df_df_non_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    # Should always specify both left_on and right_on and not 'on' at the same time.
    with pytest.raises(ValueError):
        call__determine_left_on_right_on(left, right, left_on='c')
    with pytest.raises(ValueError):
        call__determine_left_on_right_on(left, right, right_on='c')
    with pytest.raises(ValueError):
        call__determine_left_on_right_on(left, right, on='c', left_on='c')
    with pytest.raises(ValueError):
        call__determine_left_on_right_on(left, right, on='c', right_on='c')
    with pytest.raises(ValueError):
        call__determine_left_on_right_on(left, right, on='c', left_on='c', right_on='c')
    # columns must exist
    with pytest.raises(ValueError):
        call__determine_left_on_right_on(left, right, left_on='a', right_on='x')
    with pytest.raises(ValueError):
        call__determine_left_on_right_on(left, right, left_on='x', right_on='a')
    with pytest.raises(ValueError):
        call__determine_left_on_right_on(left, right, left_on='x', right_on='x')


def test__determine_left_on_right_index_on_df_df_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    assert call__determine_left_on_right_on(left, right, left_on='c', right_index=True) == (['c'], ['a'])
    assert call__determine_left_on_right_on(left, right, left_index=True, right_on='c') == (['a'], ['c'])
    assert call__determine_left_on_right_on(left, right, left_index=True, right_index=True) == (['a'], ['a'])


def test__determine_left_on_right_df_serie_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])['c']
    assert call__determine_left_on_right_on(left, right) == (['c'], ['c'])
    assert call__determine_left_on_right_on(left, right, on='c') == (['c'], ['c'])
    assert call__determine_left_on_right_on(left, right, left_on='c', right_on='c') == (['c'], ['c'])
    assert call__determine_left_on_right_on(left, right, left_on='c', right_on='a') == (['c'], ['a'])
    assert call__determine_left_on_right_on(left, right, left_on='c', right_index=True) == (['c'], ['a'])
    assert call__determine_left_on_right_on(left, right, left_index=True, right_on='c') == (['a'], ['c'])
    assert call__determine_left_on_right_on(left, right, left_index=True, right_index=True) == (['a'], ['a'])


def get_fake_df(index_names: List[str], data_names: List[str]):
    engine = object(),
    source_node = object(),
    index = {
        name: BuhTuhSeriesInt64(
            engine=engine, base_node=source_node, index=None, name=name, expression=name
        ) for name in index_names
    }
    data = {
        name: BuhTuhSeriesInt64(
            engine=engine, base_node=source_node, index=index, name=name, expression=name
        ) for name in data_names
    }
    return BuhTuhDataFrame(engine=engine, source_node=source_node, index=index, series=data)


def call__determine_left_on_right_on(
        left, right,
        on=None, left_on=None, right_on=None, left_index=False, right_index=False):
    """ Wrapper around _determine_left_on_right_on that fills in the default arguments"""
    return _determine_left_on_right_on(
        left=left,
        right=right,
        on=on,
        left_on=left_on,
        right_on=right_on,
        left_index=left_index,
        right_index=right_index
    )
