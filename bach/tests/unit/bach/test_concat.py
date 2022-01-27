import pytest

from bach.concat import ConcatOperation
from bach.expression import Expression
from tests.unit.bach.util import get_fake_df


def test_concat_empty_df() -> None:
    with pytest.raises(ValueError, match=r'no dataframe or series'):
        ConcatOperation(dfs=[])()


def test_concat_one_df() -> None:
    df = get_fake_df([], ['b', 'c'])
    result = ConcatOperation(dfs=[df])()

    assert df.all_series == result.all_series


def test_fill_missing_series() -> None:
    df1 = get_fake_df([], ['b', 'c'])
    df2 = get_fake_df([], ['b', 'e'])
    df3 = get_fake_df([], ['c', 'f', 'g'])

    dfs = [df1, df2, df3]
    result = ConcatOperation(dfs=[df1, df2, df3])._fill_missing_series(df1)

    for df in dfs:
        assert set(df.data_columns) <= set(result.data_columns)


def test_join_series_expressions() -> None:
    df1 = get_fake_df(['a'], ['b'])
    df2 = get_fake_df(['a'], ['b', 'e'])
    result = ConcatOperation(dfs=[df1, df2])._join_series_expressions(df1)

    assert isinstance(result, Expression)
    assert len(result.data) == 5


def test_get_indexes() -> None:
    df1 = get_fake_df(['a'], ['b'])
    df2 = get_fake_df(['a', 'b'], ['c', 'd'])

    with pytest.raises(ValueError, match=r'concatenation with diff'):
        ConcatOperation(dfs=[df1, df2])._get_indexes()

    df2 = df2.reset_index(level='b', drop=False)
    result = ConcatOperation(dfs=[df1, df2])._get_indexes()
    assert set(result.keys()) == {'a'}


def test_get_series() -> None:
    df1 = get_fake_df([], ['a', 'x', 'y'])
    df2 = get_fake_df([], ['c', 'd'])

    result = ConcatOperation(dfs=[df1, df2])._get_series()
    assert set(result.keys()) == {'a', 'x', 'y', 'c', 'd'}
