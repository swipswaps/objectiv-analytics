import pandas as pd
import pytest

from tests.functional.bach.test_data_and_utils import assert_equals_data, get_from_df


def test_df_basic_drop_duplicates() -> None:
    pdf = pd.DataFrame(
        data={
            'a': [1, 1, 2, 3, 4, 4, 5],
            'b': ['a', 'a', 'b', 'c', 'd', 'e', 'e'],
        }
    )

    df = get_from_df('drop_dup_table', pdf)
    result = df.drop_duplicates()

    expected_pdf = pd.DataFrame(
        data=[
            [0, 1, 'a'],
            [2, 2, 'b'],
            [3, 3, 'c'],
            [4, 4, 'd'],
            [5, 4, 'e'],
            [6, 5, 'e'],
        ],
        columns=['_index_0', 'a', 'b'],
    )

    assert_equals_data(
        result.sort_index(),
        expected_columns=expected_pdf.columns.tolist(),
        expected_data=expected_pdf.to_numpy().tolist(),
    )

    df_inplace = df.copy()
    result_inplace = df_inplace.drop_duplicates(inplace=True)
    assert result_inplace is None
    assert_equals_data(
        df_inplace.sort_index(),
        expected_columns=expected_pdf.columns.tolist(),
        expected_data=expected_pdf.to_numpy().tolist(),
    )

    result_w_ignore_index = df.drop_duplicates(ignore_index=True)
    assert_equals_data(
        result_w_ignore_index.sort_values(by='a'),
        expected_columns=['a', 'b'],
        expected_data=expected_pdf[['a', 'b']].to_numpy().tolist(),
    )


def test_df_basic_w_subset_drop_duplicates() -> None:
    pdf = pd.DataFrame(
        data={
            'a': [1, 1, 2, 3, 4, 4, 5],
            'b': ['a', 'a', 'b', 'c', 'd', 'e', 'e'],
            'c': [0, 1, 2, 3, 4, 5, 6]
        }
    )
    subset = ['a', 'b']
    df = get_from_df('drop_dup_table', pdf)
    result = df.drop_duplicates(subset=subset)

    expected_pdf = pd.DataFrame(
        data=[
            [0, 1, 'a', 0],
            [2, 2, 'b', 2],
            [3, 3, 'c', 3],
            [4, 4, 'd', 4],
            [5, 4, 'e', 5],
            [6, 5, 'e', 6],
        ],
        columns=['_index_0', 'a', 'b', 'c'],
    )

    assert_equals_data(
        result.sort_index(),
        expected_columns=expected_pdf.columns.tolist(),
        expected_data=expected_pdf.to_numpy().tolist(),
    )

    df_inplace = df.copy()
    result_inplace = df_inplace.drop_duplicates(subset=subset, inplace=True)
    assert result_inplace is None

    assert_equals_data(
        df_inplace.sort_index(),
        expected_columns=expected_pdf.columns.tolist(),
        expected_data=expected_pdf.to_numpy().tolist(),
    )

    result_w_ignore_index = df.drop_duplicates(subset=subset, ignore_index=True)
    assert_equals_data(
        result_w_ignore_index.sort_values(by='c'),
        expected_columns=['a', 'b', 'c'],
        expected_data=expected_pdf[['a', 'b', 'c']].to_numpy().tolist(),
    )


def test_df_keep_last_drop_duplicates() -> None:
    pdf = pd.DataFrame(
        data={
            'a': [1, 1, 1, 3, 4, 1, 1],
            'b': ['a', 'b', 'b', 'c', 'd', 'a', 'a'],
        }
    )
    df = get_from_df('drop_dup_table', pdf)
    result = df.drop_duplicates(keep='last')

    expected_df = pd.DataFrame(
        data=[
            [2, 1, 'b'],
            [3, 3, 'c'],
            [4, 4, 'd'],
            [6, 1, 'a'],
        ],
        columns=['_index_0', 'a', 'b'],
    )
    assert_equals_data(
        result.sort_index(),
        expected_columns=expected_df.columns.tolist(),
        expected_data=expected_df.to_numpy().tolist(),
    )

    df_inplace = df.copy()
    result_inplace = df_inplace.drop_duplicates(keep='last', inplace=True)
    assert result_inplace is None
    assert_equals_data(
        df_inplace.sort_index(),
        expected_columns=expected_df.columns.tolist(),
        expected_data=expected_df.to_numpy().tolist(),
    )

    result_w_ignore_index = df.drop_duplicates(keep='last', ignore_index=True)

    subset = ['a', 'b']
    expected_df2 = expected_df[subset].sort_values(by=subset)
    assert_equals_data(
        result_w_ignore_index.sort_values(by=subset),
        expected_columns=subset,
        expected_data=expected_df2.to_numpy().tolist(),
    )


def test_df_drop_all_duplicates() -> None:
    pdf = pd.DataFrame(
        data={
            'a': [1, 1, 1, 3, 4, 1, 1],
            'b': ['a', 'b', 'b', 'c', 'd', 'a', 'a'],
        }
    )
    df = get_from_df('drop_dup_table', pdf)

    result = df.drop_duplicates(keep=False)

    assert_equals_data(
        result.sort_index(),
        expected_columns=['_index_0', 'a', 'b'],
        expected_data=[
            [3, 3, 'c'],
            [4, 4, 'd'],
        ],
    )

    result_w_no_index = df.drop_duplicates(keep=False, ignore_index=True)
    assert_equals_data(
        result_w_no_index.sort_values(by='a'),
        expected_columns=['a', 'b'],
        expected_data=[
            [3, 'c'],
            [4, 'd'],
        ],
    )


def test_errors_drop_duplicates() -> None:
    pdf = pd.DataFrame(
        data={
            'a': [1, 1, 1, 3, 4, 1, 1],
            'b': ['a', 'b', 'b', 'c', 'd', 'a', 'a'],
        }
    )
    df = get_from_df('drop_dup_table', pdf)
    with pytest.raises(ValueError, match=r'keep must be either'):
        df.drop_duplicates(keep='random')

    with pytest.raises(ValueError, match=r'subset param contains'):
        df.drop_duplicates(subset='random')
