import pandas as pd
import pytest

from tests.functional.bach.test_data_and_utils import assert_equals_data, get_from_df


def test_series_basic_drop_duplicates() -> None:
    p_series = pd.Series(
        index=pd.RangeIndex(stop=7),
        data=[1, 1, 2, 3, 4, 4, 5],
        name='a',
    )
    df = get_from_df('drop_dup_table', p_series.to_frame())

    result = df.a.drop_duplicates()
    expected = p_series.drop_duplicates().sort_values()
    pd.testing.assert_series_equal(result.sort_values().to_pandas(), expected, check_names=False)


def test_series_keep_last_drop_duplicates() -> None:
    p_series = pd.Series(
        index=pd.RangeIndex(stop=7),
        data=[1, 1, 2, 3, 4, 4, 5],
        name='a',
    )
    df = get_from_df('drop_dup_table', p_series.to_frame())

    result = df.a.drop_duplicates(keep='last')
    expected = p_series.drop_duplicates(keep='last').sort_values()
    pd.testing.assert_series_equal(result.sort_values().to_pandas(), expected, check_names=False)


def test_series_drop_all_duplicates() -> None:
    p_series = pd.Series(
        index=pd.RangeIndex(stop=7),
        data=[1, 1, 2, 3, 4, 4, 5],
        name='a',
    )
    df = get_from_df('drop_dup_table', p_series.to_frame())

    result = df.a.drop_duplicates(keep=False)
    expected = p_series.drop_duplicates(keep=False).sort_values()
    pd.testing.assert_series_equal(result.sort_values().to_pandas(), expected, check_names=False)
