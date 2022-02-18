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
    df = df.sort_values(by='A', ascending=False)

    result_ffill = df.fillna(
        method='ffill', sort_by=['A', 'B', 'C'], ascending=[False, True, False],
    )
    assert_equals_data(
        result_ffill,
        expected_columns=['_index_0', 'A', 'B', 'C', 'D'],
        expected_data=[
            [3, None, 2, None, 0],
            [2, None, 3, None, 4],
            [0, None, 3, None, 4],
            [4, None, 3, None, 4],
            [6, None, 3, None, 4],
            [7, None, 3, 1, 4],
            [1, 3, 4, 1, 1],
            [5, 1, 4, 1, 1],
        ],
    )
    result_bfill = df.fillna(
        method='bfill', sort_by=['A', 'B', 'C'], ascending=[False, True, False],
    )
    assert_equals_data(
        result_bfill,
        expected_columns=['_index_0', 'A', 'B', 'C', 'D'],
        expected_data=[
            [3, 3, 2, 1, 0],
            [2, 3, 3, 1, 4],
            [1, 3, 4, None, 1],
            [6, 3, 4, 1, 1],
            [0, 3, 4, 1, 1],
            [7, 3, 4, 1, 1],
            [4, 3, 4, 1, 1],
            [5, 1, None, None, None],
        ],
    )


def test_fillna_w_methods_w_sorted_df() -> None:
    pdf = pd.DataFrame(DATA, columns=list("ABCD"))
    df = get_from_df('test_df_fillna', pdf).sort_index()

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
