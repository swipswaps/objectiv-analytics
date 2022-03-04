"""
Copyright 2021 Objectiv B.V.
"""
import pytest

from bach.expression import Expression
from bach.merge import (
    _determine_merge_on, _determine_result_columns, ResultSeries, merge, How, MergeOn,
    _verify_on_conflicts, _resolve_merge_expression_references
)
from tests.unit.bach.util import get_fake_df


def test__determine_merge_on_simple_df_df_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    assert call__determine_merge_on(left, right) == MergeOn(['c'], ['c'], [])


def test__determine_merge_on_simple_df_df_non_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['d', 'e'])
    with pytest.raises(ValueError):
        # TODO: should we match on index in this case? That seems to make sense
        # there are no columns in left and right with the same name
        call__determine_merge_on(left, right)


def test__determine_merge_on_on_df_df_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    assert call__determine_merge_on(left, right, on='c') == MergeOn(['c'], ['c'], [])
    assert call__determine_merge_on(left, right, on=['c']) == MergeOn(['c'], ['c'], [])
    assert call__determine_merge_on(left, right, on='a') == MergeOn(['a'], ['a'], [])
    assert call__determine_merge_on(left, right, on=['a']) == MergeOn(['a'], ['a'], [])
    assert call__determine_merge_on(left, right, on=['a', 'c']) == MergeOn(['a', 'c'], ['a', 'c'], [])


def test__determine_merge_on_on_df_df_non_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    with pytest.raises(ValueError):
        # 'x' does not exist in either of the dfs
        call__determine_merge_on(left, right, on='x')
    with pytest.raises(ValueError):
        # 'b' does not exist in the right df
        call__determine_merge_on(left, right, on='b')
    with pytest.raises(ValueError):
        # 'd' does not exist in the left df
        call__determine_merge_on(left, right, on='d')
    with pytest.raises(ValueError, match='how'):
        # Cannot specify 'on' with how='cross'
        call__determine_merge_on(left, right, How.cross, on='c')


def test__determine_merge_on_left_on_right_on_df_df_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    assert call__determine_merge_on(left, right, left_on='c', right_on='c') == MergeOn(['c'], ['c'], [])
    assert call__determine_merge_on(left, right, left_on=['c'], right_on='c') == MergeOn(['c'], ['c'], [])
    assert call__determine_merge_on(left, right, left_on='c', right_on=['c']) == MergeOn(['c'], ['c'], [])
    assert call__determine_merge_on(left, right, left_on='a', right_on='a') == MergeOn(['a'], ['a'], [])
    assert call__determine_merge_on(left, right, left_on=['a'], right_on=['a']) == MergeOn(['a'], ['a'], [])
    assert call__determine_merge_on(left, right, left_on=['a', 'c'], right_on=['a', 'c']) \
           == MergeOn(['a', 'c'], ['a', 'c'], [])
    assert call__determine_merge_on(left, right, left_on=['a'], right_on=['c']) == MergeOn(['a'], ['c'], [])
    assert call__determine_merge_on(left, right, left_on=['a', 'b'], right_on=['a', 'd']) \
           == MergeOn(['a', 'b'], ['a', 'd'], [])


def test__determine_merge_on_left_on_right_on_df_df_non_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    # Should always specify both left_on and right_on and not 'on' at the same time.
    with pytest.raises(ValueError):
        call__determine_merge_on(left, right, left_on='c')
    with pytest.raises(ValueError):
        call__determine_merge_on(left, right, right_on='c')
    with pytest.raises(ValueError):
        call__determine_merge_on(left, right, on='c', left_on='c')
    with pytest.raises(ValueError):
        call__determine_merge_on(left, right, on='c', right_on='c')
    with pytest.raises(ValueError):
        call__determine_merge_on(left, right, on='c', left_on='c', right_on='c')
    # columns must exist
    with pytest.raises(ValueError):
        call__determine_merge_on(left, right, left_on='a', right_on='x')
    with pytest.raises(ValueError):
        call__determine_merge_on(left, right, left_on='x', right_on='a')
    with pytest.raises(ValueError):
        call__determine_merge_on(left, right, left_on='x', right_on='x')
    # Cannot specify '*_on' with how='cross'
    with pytest.raises(ValueError, match='how'):
        call__determine_merge_on(left, right, How.cross, left_on='c', right_on='c')


def test__determine_merge_index_on_df_df_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])
    assert call__determine_merge_on(left, right, left_on='c', right_index=True) == MergeOn(['c'], ['a'], [])
    assert call__determine_merge_on(left, right, left_index=True, right_on='c') == MergeOn(['a'], ['c'], [])
    assert call__determine_merge_on(left, right, left_index=True, right_index=True) == \
           MergeOn(['a'], ['a'], [])


def test__determine_merge_df_serie_happy():
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd'])['c']
    assert call__determine_merge_on(left, right) == MergeOn(['c'], ['c'], [])
    assert call__determine_merge_on(left, right, on='c') == MergeOn(['c'], ['c'], [])
    assert call__determine_merge_on(left, right, left_on='c', right_on='c') == MergeOn(['c'], ['c'], [])
    assert call__determine_merge_on(left, right, left_on='c', right_on='a') == MergeOn(['c'], ['a'], [])
    assert call__determine_merge_on(left, right, left_on='c', right_index=True) == MergeOn(['c'], ['a'], [])
    assert call__determine_merge_on(left, right, left_index=True, right_on='c') == MergeOn(['a'], ['c'], [])
    assert call__determine_merge_on(left, right, left_index=True, right_index=True) == \
           MergeOn(['a'], ['a'], [])


def test__determine_merge_on_w_conditional() -> None:
    left = get_fake_df(['a'], ['b', 'c'])
    right = get_fake_df(['a'], ['c', 'd']).materialize()['c']
    series_bool = left['c'] == right
    assert call__determine_merge_on(left, right, on=[series_bool]) == MergeOn([], [], [series_bool])
    assert call__determine_merge_on(left, right, on=[series_bool, 'c']) == MergeOn(['c'], ['c'], [series_bool])
    assert call__determine_merge_on(left, right, on=[series_bool], left_index=True, right_index=True) == \
           MergeOn(['a'], ['a'], [series_bool])


def test__determine_result_columns():
    left = get_fake_df(['a'], ['b', 'c'], 'int64')
    right = get_fake_df(['a'], ['c', 'd'], 'float64')
    result = _determine_result_columns(left, right, MergeOn(['a'], ['a'], []), ('_x', '_y'))
    assert result == (
        [
            ResultSeries(name='a', expression=Expression.construct('COALESCE("l"."a", "r"."a")'), dtype='int64'),
        ], [
            ResultSeries(name='b', expression=Expression.table_column_reference('l', 'b'), dtype='int64'),
            ResultSeries(name='c_x', expression=Expression.table_column_reference('l', 'c'), dtype='int64'),
            ResultSeries(name='c_y', expression=Expression.table_column_reference('r', 'c'), dtype='float64'),
            ResultSeries(name='d', expression=Expression.table_column_reference('r', 'd'), dtype='float64')
        ]
    )
    result = _determine_result_columns(left, right, MergeOn(['c'], ['c'], []), ('_x', '_y'))
    assert result == (
        [
            ResultSeries(name='a_x', expression=Expression.table_column_reference('l', 'a'), dtype='int64'),
            ResultSeries(name='a_y', expression=Expression.table_column_reference('r', 'a'), dtype='float64'),
        ], [
            ResultSeries(name='b', expression=Expression.table_column_reference('l', 'b'), dtype='int64'),
            ResultSeries(name='c', expression=Expression.construct('COALESCE("l"."c", "r"."c")'), dtype='int64'),
            ResultSeries(name='d', expression=Expression.table_column_reference('r', 'd'), dtype='float64')
        ]
    )
    result = _determine_result_columns(left, right, MergeOn(['a', 'c'], ['a', 'c'], []), ('_x', '_y'))
    assert result == (
        [
            ResultSeries(name='a', expression=Expression.construct('COALESCE("l"."a", "r"."a")'), dtype='int64'),
        ], [
            ResultSeries(name='b', expression=Expression.table_column_reference('l', 'b'), dtype='int64'),
            ResultSeries(name='c', expression=Expression.construct('COALESCE("l"."c", "r"."c")'), dtype='int64'),
            ResultSeries(name='d', expression=Expression.table_column_reference('r', 'd'), dtype='float64')
        ]
    )

def test__determine_result_columns_non_happy_path():
    # With pandas the following works, there will just be two b_x and two b_y columns, but we cannot
    # generate sql that has the same column name multiple times, so we raise an error
    left = get_fake_df(['a'], ['b', 'b_x'], 'int64')
    right = get_fake_df(['a'], ['b', 'b_y'], 'float64')
    with pytest.raises(ValueError):
        _determine_result_columns(left, right, MergeOn(['a'], ['a'], []), ('_x', '_y'))


def test_merge_non_happy_path_how():
    left = get_fake_df(['a'], ['b', 'b_x'], 'int64')
    right = get_fake_df(['a'], ['b', 'b_y'], 'float64')
    with pytest.raises(ValueError, match='how'):
        merge(left, right, 'wrong how',
              on=None, left_on=None, right_on=None, left_index=True, right_index=True,
              suffixes=('_x', '_y'))


def test_verify_on_conflicts() -> None:
    left = get_fake_df(['a'], ['b'], 'int64')
    right = get_fake_df(['a'], ['b'], 'float64')
    with pytest.raises(ValueError, match=r'if how == "cross"'):
        _verify_on_conflicts(
            left,
            right,
            How.cross,
            on=['a'],
            left_on=None,
            right_on=None,
            left_index=False,
            right_index=False,
        )

    with pytest.raises(ValueError, match=r'left_on and left_index'):
        _verify_on_conflicts(
            left,
            right,
            How.left,
            on=None,
            left_on=['a'],
            right_on=None,
            left_index=True,
            right_index=False,
        )

    with pytest.raises(ValueError, match=r'right_on and right_index'):
        _verify_on_conflicts(
            left,
            right,
            How.left,
            on=None,
            left_on=['a'],
            right_on=['a'],
            left_index=False,
            right_index=True,
        )

    with pytest.raises(ValueError, match=r'Either both left_on and right_on should be specified'):
        _verify_on_conflicts(
            left,
            right,
            How.left,
            on=None,
            left_on=['a'],
            right_on=None,
            left_index=False,
            right_index=False,
        )

    with pytest.raises(ValueError, match=r'but not all three'):
        _verify_on_conflicts(
            left,
            right,
            How.left,
            on=['a', left['b'] == right['b']],
            left_on=['a'],
            right_on=['a'],
            left_index=False,
            right_index=False,
        )


def test_verify_on_conflicts_conditional() -> None:
    left = get_fake_df(['a'], ['b'], 'float64')
    right = get_fake_df(['a'], ['b'], 'float64')
    bool_series = left['b'] == left['b']

    with pytest.raises(ValueError, match=r'valid only when left.base_node != right.base_node.'):
        _verify_on_conflicts(
            left,
            right,
            How.left,
            on=[bool_series],
            left_on=None,
            right_on=None,
            left_index=False,
            right_index=False,
        )

    right = right.materialize()
    bool_series.base_node._references = {
        'left_node': left.base_node,
        'right_node': left.base_node,
    }

    with pytest.raises(ValueError, match=r'must have both base_nodes to be merged as references.'):
        _verify_on_conflicts(
            left,
            right,
            How.left,
            on=[bool_series],
            left_on=None,
            right_on=None,
            left_index=False,
            right_index=False,
        )

    other_df = get_fake_df(['a'], ['b'], 'float64')
    other_df = other_df.materialize(node_name='other')
    bool_series = left['b'] > right['b'] + other_df['b']

    with pytest.raises(ValueError, match=r'BooleanSeries has reference to more than 2 nodes.'):
        _verify_on_conflicts(
            left,
            right,
            How.left,
            on=[bool_series],
            left_on=None,
            right_on=None,
            left_index=False,
            right_index=False,
        )


def test_resolve_merge_expression_references() -> None:
    left = get_fake_df(['a'], ['b', 'd'], 'float64')
    right = get_fake_df(['a'], ['c', 'd'], 'float64').materialize()

    bool_series = left['d'] > right['d']
    expected = '"l"."d" > "r"."d"'
    result = _resolve_merge_expression_references(
        left_node=left.base_node,
        right_node=right.base_node,
        node=bool_series.base_node,
        expr=bool_series.expression,
    ).to_sql()
    assert expected == result

    bool_series = left['b'] / right['c'] * left['d'] > right['d']
    expected = '"l"."b" / "r"."c" * "l"."d" > "r"."d"'
    result = _resolve_merge_expression_references(
        left_node=left.base_node,
        right_node=right.base_node,
        node=bool_series.base_node,
        expr=bool_series.expression,
    ).to_sql()
    assert expected == result

    bool_series = left['b'] / right['c'] * left['d'] > 10
    expected = '("l"."b" / "r"."c" * "l"."d") > cast(10 as bigint)'
    result = _resolve_merge_expression_references(
        left_node=left.base_node,
        right_node=right.base_node,
        node=bool_series.base_node,
        expr=bool_series.expression,
    ).to_sql()
    assert expected == result

    bool_series = (left['b'] > right['c']) | (left['d'] < right['d'])
    expected = '("l"."b" > "r"."c") OR ("l"."d" < "r"."d")'
    result = _resolve_merge_expression_references(
        left_node=left.base_node,
        right_node=right.base_node,
        node=bool_series.base_node,
        expr=bool_series.expression,
    ).to_sql()
    assert expected == result

    bool_series = (right['d'] + right['d']) / left['d'] > right['d'] / right['d']
    expected = '"r"."d" + "r"."d" / "l"."d" > "r"."d" / "r"."d"'
    result = _resolve_merge_expression_references(
        left_node=left.base_node,
        right_node=right.base_node,
        node=bool_series.base_node,
        expr=bool_series.expression,
    ).to_sql()
    assert expected == result


def test_resolve_nested_expression_references_error() -> None:
    left = get_fake_df(['a'], ['b', 'd'], 'float64')
    right = get_fake_df(['a'], ['c', 'd'], 'float64').materialize()
    bool_series = right['c'].copy_override_dtype(dtype=bool)
    with pytest.raises(Exception, match=r'has no valid column reference'):
        _resolve_merge_expression_references(
            left_node=left.base_node,
            right_node=left.base_node,
            node=bool_series.base_node,
            expr=bool_series.expression,
        )


def call__determine_merge_on(
        left, right,
        how=How.inner, on=None, left_on=None, right_on=None, left_index=False, right_index=False):
    """ Wrapper around _determine_merge_on that fills in the default arguments"""
    return _determine_merge_on(
        left=left,
        right=right,
        how=how,
        on=on,
        left_on=left_on,
        right_on=right_on,
        left_index=left_index,
        right_index=right_index
    )
