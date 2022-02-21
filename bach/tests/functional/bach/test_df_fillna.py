import pandas as pd
import pytest

from tests.functional.bach.test_data_and_utils import get_from_df, assert_equals_data

DATA = [
    [None, None, None, None, None],
    [3,    4,    None, 1,    1],
    [None, 3,    None, 4,    None],
    [None, 2,    None, 0,    None],
    [None, None, None, None, 2],
    [1,    None, None, None, None],
    [None, None, None, None, 3],
    [None, None, 1,    None, None],
]


def test_basic_fillna() -> None:
    pdf = pd.DataFrame(DATA, columns=list("ABCDE"))
    df = get_from_df('test_df_fillna', pdf)
    df = df.astype('int64')

    result = df.fillna(value=0)
    assert_equals_data(
        result,
        expected_columns=['_index_0', 'A', 'B', 'C', 'D', 'E'],
        expected_data=[
            [0, 0, 0, 0, 0, 0],
            [1, 3, 4, 0, 1, 1],
            [2, 0, 3, 0, 4, 0],
            [3, 0, 2, 0, 0, 0],
            [4, 0, 0, 0, 0, 2],
            [5, 1, 0, 0, 0, 0],
            [6, 0, 0, 0, 0, 3],
            [7, 0, 0, 1, 0, 0],
        ],
    )
    pd.testing.assert_frame_equal(
        pdf.fillna(value=0),
        result.sort_index().to_pandas(),
        check_names=False,
        check_dtype=False,
    )


def test_fillna_w_methods() -> None:
    pdf = pd.DataFrame(DATA, columns=list("ABCDE"))
    df = get_from_df('test_df_fillna', pdf)

    result_ffill = df.fillna(
        method='ffill', sort_by=['A', 'B', 'C'], ascending=[False, True, False],
    )
    assert_equals_data(
        result_ffill,
        expected_columns=['_index_0', 'A', 'B', 'C', 'D', 'E'],
        expected_data=[
            [3, None, 2, None, 0,  None],
            [2, None, 3, None, 4,  None],
            [0, None, 3, None, 4,  None],
            [4, None, 3, None, 4,  2],
            [6, None, 3, None, 4,  3],
            [7, None, 3, 1,    4,  3],
            [1, 3,    4, 1,    1,  1],
            [5, 1,    4, 1,    1,  1],
        ],
    )

    result_bfill = df.fillna(
        method='bfill', sort_by=['A', 'B', 'C'], ascending=[False, True, False],
    )
    assert_equals_data(
        result_bfill,
        expected_columns=['_index_0', 'A', 'B', 'C', 'D', 'E'],
        expected_data=[
            [3, 3, 2,    1,    0,    3],
            [2, 3, 3,    1,    4,    3],
            [1, 3, 4,    None, 1,    1],
            [6, 3, 4,    1,    1,    3],
            [0, 3, 4,    1,    1,    2],
            [7, 3, 4,    1,    1,    1],
            [4, 3, 4,    1,    1,    2],
            [5, 1, None, None, None, None],
        ],
    )


def test_fillna_w_methods_w_sorted_df() -> None:
    pdf = pd.DataFrame(DATA, columns=list("ABCDE"))
    df = get_from_df('test_df_fillna', pdf).sort_index()

    result_ffill = df.fillna(method='ffill')
    assert_equals_data(
        result_ffill,
        expected_columns=['_index_0', 'A', 'B', 'C', 'D', 'E'],
        expected_data=[
            [0, None, None, None, None, None],
            [1, 3,    4,    None, 1,    1],
            [2, 3,    3,    None, 4,    1],
            [3, 3,    2,    None, 0,    1],
            [4, 3,    2,    None, 0,    2],
            [5, 1,    2,    None, 0,    2],
            [6, 1,    2,    None, 0,    3],
            [7, 1,    2,    1,    0,    3],
        ],
    )

    result_bfill = df.fillna(method='bfill')
    assert_equals_data(
        result_bfill,
        expected_columns=['_index_0', 'A', 'B', 'C', 'D', 'E'],
        expected_data=[
            [0, 3,    4,    1, 1,    1],
            [1, 3,    4,    1, 1,    1],
            [2, 1,    3,    1, 4,    2],
            [3, 1,    2,    1, 0,    2],
            [4, 1,    None, 1, None, 2],
            [5, 1,    None, 1, None, 3],
            [6, None, None, 1, None, 3],
            [7, None, None, 1, None, None],
        ],
    )


def test_fillna_errors():
    pdf = pd.DataFrame(DATA, columns=list("ABCDE"))
    df = get_from_df('test_df_fillna', pdf)
    with pytest.raises(ValueError, match=r'cannot specify both "method" and "value".'):
        df.fillna(value=0, method='ffill')

    with pytest.raises(Exception, match=r'"random" is not a valid method.'):
        df.fillna(method='random')

    with pytest.raises(Exception, match=r'dataframe must be sorted'):
        df.fillna(method='ffill')
