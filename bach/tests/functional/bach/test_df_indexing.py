from typing import Tuple

import pandas as pd
import pytest

from bach import Series, DataFrame
from tests.functional.bach.test_data_and_utils import get_from_df, assert_equals_data


@pytest.fixture()
def indexing_dfs() -> Tuple[pd.DataFrame, DataFrame]:
    pdf = pd.DataFrame(
        {
            'A': ['a', 'b', 'c', 'd', 'e'],
            'B': [0, 1, 2, 3, 4],
            'C': [5, 6, 7, 8, 9],
            'D': ['f', 'g', 'h', 'i', 'j'],
        },
    )
    df = get_from_df('indexing_df', pdf)
    df = df.set_index('A', drop=True)
    pdf = pdf.set_index('A')

    return pdf, df


def test_basic_indexing(indexing_dfs: Tuple[pd.DataFrame, DataFrame]) -> None:
    pdf, df = indexing_dfs

    single_label_result = df.loc['b']
    assert isinstance(single_label_result, Series)
    pd.testing.assert_series_equal(
        pdf.loc['b'].astype(str),
        single_label_result.to_pandas(),
        check_names=False,
    )

    label_list_result = df.loc[['c', 'e']]
    assert isinstance(label_list_result, DataFrame)
    pd.testing.assert_frame_equal(
        pdf.loc[['c', 'e']],
        label_list_result.sort_index().to_pandas(),
        check_names=False,
    )

    bool_result = df.loc[df['D'] == 'g']
    assert isinstance(bool_result, DataFrame)
    pd.testing.assert_frame_equal(
        pdf.loc[pdf['D'] == 'g'],
        bool_result.sort_index().to_pandas(),
        check_names=False,
    )


def test_basic_indexing_column_based(indexing_dfs: Tuple[pd.DataFrame, DataFrame]) -> None:
    pdf, df = indexing_dfs

    single_label_column_result = df.loc['d', 'D']

    # pandas returns a scalar for this example
    assert_equals_data(
        single_label_column_result,
        expected_columns=['__stacked_index', '__stacked'],
        expected_data=[['D', 'i']],
    )
    isinstance(single_label_column_result, Series)

    list_label_column_result = df.loc['d', ['C', 'D']]
    pd.testing.assert_series_equal(
        pdf.loc['d', ['C', 'D']].astype(str),
        list_label_column_result.sort_index().to_pandas(),
        check_names=False,
    )


def test_index_slicing(indexing_dfs: Tuple[pd.DataFrame, DataFrame]) -> None:
    pdf, df = indexing_dfs

    df = df.sort_index()
    result_slicing = df.loc['b':'d']
    pd.testing.assert_frame_equal(
        pdf.sort_index().loc['b':'d'],
        result_slicing.to_pandas(),
    )

    result_no_stop_slicing = df.loc['b':]
    pd.testing.assert_frame_equal(
        pdf.loc['b':],
        result_no_stop_slicing.to_pandas(),
    )

    result_no_start_slicing = df.loc[:'c']
    pd.testing.assert_frame_equal(
        pdf.loc[:'c'],
        result_no_start_slicing.to_pandas(),
    )

    result_column_slicing = df.loc[:, 'B':'D']

    pd.testing.assert_frame_equal(
        pdf.loc[:, 'B':'D'],
        result_column_slicing.to_pandas(),
    )

    result_column_no_stop_slicing = df.loc[:, 'B':]
    pd.testing.assert_frame_equal(
        pdf.loc[:, 'B':],
        result_column_no_stop_slicing.to_pandas(),
    )

    result_column_no_start_slicing = df.loc[:, :'C']
    pd.testing.assert_frame_equal(
        pdf.loc[:, :'C'],
        result_column_no_start_slicing.to_pandas(),
    )
