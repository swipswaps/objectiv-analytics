import numpy as np
import pandas as pd

from tests.functional.bach.test_data_and_utils import get_from_df


def test_append_w_aligned_columns() -> None:
    caller_pdf = pd.DataFrame({'a': [1, 2, 3, 4, 5], 'b': ['a', 'b', 'c', 'd', 'e']})
    other_pdf = pd.DataFrame({'a': [6, 7, 8, 9], 'b': ['f', 'g', 'h', 'i']})

    caller_df = get_from_df('caller_df', caller_pdf)
    other_df = get_from_df('other_df', other_pdf)

    result = caller_df.append(other_df).sort_values('a').reset_index(drop=False)
    expected = caller_pdf.append(other_pdf).sort_values('a').reset_index(drop=False)
    np.testing.assert_equal(expected.values, result.values)


def test_append_w_non_aligned_columns() -> None:
    caller_pdf = pd.DataFrame({'a': [1, 2, 3, 4, 5], 'b': ['a', 'b', 'c', 'd', 'e']})
    other_pdf = pd.DataFrame({'d': [6, 7, 8, 9], 'c': ['f', 'g', 'h', 'i']})

    caller_df = get_from_df('caller_df', caller_pdf)
    other_df = get_from_df('other_df', other_pdf)
    result = caller_df.append(other_df).sort_values('a').reset_index(drop=False)

    expected = caller_pdf.append(other_pdf).sort_values('a').reset_index(drop=False)
    expected = expected.rename(columns={'index': '_index_0'})

    result_pdf = result.to_pandas()
    pd.testing.assert_frame_equal(expected, result_pdf)


def test_append_w_ignore_index_n_sort() -> None:
    caller_pdf = pd.DataFrame({'a': [1, 2, 3, 4, 5], 'b': ['a', 'b', 'c', 'd', 'e']})
    other_pdf = pd.DataFrame({'d': [6, 7, 8, 9], 'c': ['f', 'g', 'h', 'i']})

    caller_df = get_from_df('caller_df', caller_pdf)

    other_df = get_from_df('other_df', other_pdf)
    other_df = other_df.set_index(['d'])

    result = caller_df.append(other_df, ignore_index=True).sort_values('a').to_pandas()

    expected = caller_pdf.append(other_pdf.set_index(['d']), ignore_index=True).sort_values('a')
    pd.testing.assert_frame_equal(expected, result)

    result2 = caller_df.append(other_df, ignore_index=True, sort=True).sort_values('a').to_pandas()

    expected2 = caller_pdf.append(other_pdf.set_index(['d']), ignore_index=True, sort=True)
    pd.testing.assert_frame_equal(expected2, result2)


def test_append_w_list_dfs() -> None:
    caller_pdf = pd.DataFrame({'a': [1, 2, 3, 4, 5], 'b': ['a', 'b', 'c', 'd', 'e']})
    other_pdf = pd.DataFrame({'d': [6, 7, 8, 9], 'c': ['f', 'g', 'h', 'i']})

    caller_df = get_from_df('caller_df', caller_pdf)
    other_dfs = [get_from_df(f'other_{i}_df', other_pdf) for i in range(3)]

    result = caller_df.append(other_dfs).sort_values('a').to_pandas()

    expected = caller_pdf.append([other_pdf] * 3).sort_values('a')

    pd.testing.assert_frame_equal(expected, result, check_names=False)

