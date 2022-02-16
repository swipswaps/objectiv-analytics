import numpy as np
import pandas as pd

from tests.functional.bach.test_data_and_utils import get_from_df, assert_equals_data

DATA = [
    [None, None, None, None],
    [3, 4, None, 1],
    [None, 3, None, 4],
    [None, 2, None, 0],
    [None, None, None, None],
    [1, None, None, None],
    [None, None, None, None],
    [None, None, 1, None],
]


def test_basic_fillna() -> None:
    pdf = pd.DataFrame(DATA, columns=list("ABCD"))
    df = get_from_df('test_df_fillna', pdf)
    df = df.astype('int64')

    result = df.fillna(value=0)
    assert_equals_data(
        result,
        expected_columns=['_index_0', 'A', 'B', 'C', 'D'],
        expected_data=[
            [0, 0, 0, 0, 0],
            [1, 3, 4, 0, 1],
            [2, 0, 3, 0, 4],
            [3, 0, 2, 0, 0],
            [4, 0, 0, 0, 0],
            [5, 1, 0, 0, 0],
            [6, 0, 0, 0, 0],
            [7, 0, 0, 1, 0],
        ],
    )


def test_fillna_w_methods() -> None:
    pdf = pd.DataFrame(DATA, columns=list("ABCD"))
    df = get_from_df('test_df_fillna', pdf)

    result_ffill = df.fillna(method='ffill')
    assert_equals_data(
        result_ffill,
        expected_columns=['_index_0', 'A', 'B', 'C', 'D'],
        expected_data=[
            [0, None, None, None, None],
            [1, 3, 4, None, 1],
            [2, 3, 3, None, 4],
            [3, 3, 2, None, 0],
            [4, 3, 2, None, 0],
            [5, 1, 2, None, 0],
            [6, 1, 2, None, 0],
            [7, 1, 2, 1, 0],
        ],
    )

    result_bfill = df.fillna(method='bfill')
    assert_equals_data(
        result_bfill,
        expected_columns=['_index_0', 'A', 'B', 'C', 'D'],
        expected_data=[
            [0, 3, 4, 1, 1],
            [1, 3, 4, 1, 1],
            [2, 1, 3, 1, 4],
            [3, 1, 2, 1, 0],
            [4, 1, None, 1, None],
            [5, 1, None, 1, None],
            [6, None, None, 1, None],
            [7, None, None, 1, None],
        ],
    )


def test_fillna_w_methods_sorted_df() -> None:
    pdf = pd.DataFrame(DATA, columns=list("ABCD"))
    df = get_from_df('test_df_fillna', pdf)
    df = df.sort_values(by='A', ascending=False)

    result_ffill = df.fillna(method='ffill')
    assert_equals_data(
        result_ffill.reset_index(drop=True),
        expected_columns=['A', 'B', 'C', 'D'],
        expected_data=[
            [None, None, None, None],
            [None, 4, None, 1],
            [None, 3, None, 4],
            [None, 2, None, 0],
            [None, 2, None, 0],
            [None, 3, None, 0],
            [3, 4, None, 0],
            [1, 4, 1, 0],
        ],

    result_bfill = df.fillna(method='bfill')
    assert_equals_data(
        result_bfill,
        expected_columns=['_index_0', 'A', 'B', 'C', 'D'],
        expected_data=[
            [0, 3, 4, 1, 1],
            [1, 3, 4, 1, 1],
            [2, 1, 3, 1, 4],
            [3, 1, 2, 1, 0],
            [4, 1, None, 1, None],
            [5, 1, None, 1, None],
            [6, None, None, 1, None],
            [7, None, None, 1, None],
        ],
    )

"""
move this to series.fillna
    series_a = df.all_series['A']

    fillna_ffill_result = series_a.fillna(value=0., method='ffill')
    np.testing.assert_equal(
        fillna_ffill_result.to_numpy(),
        [0., 3., 3., 3., 3., 1., 1., 1.],
    )

    ffill_result = series_a.ffill()
    np.testing.assert_equal(
        ffill_result.to_numpy(),
        [np.nan, 3, 3, 3, 3, 1, 1, 1],
    )

    sorted_ffill_result = series_a.sort_values(ascending=True).ffill()
    np.testing.assert_equal(
        sorted_ffill_result.to_numpy(),
        [1, 3, 3, 3, 3, 3, 3, 3],
    )

    bfill_result = series_a.bfill()
    np.testing.assert_equal(
        bfill_result.to_numpy(),
        [3, 3, 1, 1, 1, 1, np.nan, np.nan],
    )
    sorted_bfill_result = series_a.sort_values(ascending=False).bfill()
    np.testing.assert_equal(
        sorted_bfill_result.to_numpy(),
        [3, 3, 3, 3, 3, 3, 3, 1],
    )
"""