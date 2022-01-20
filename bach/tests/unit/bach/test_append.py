import numpy as np
import pandas as pd

from bach.append import AppendOperation
from tests.functional.bach.test_data_and_utils import get_from_df


def test_append_w_aligned_columns() -> None:
    caller_pdf = pd.DataFrame({'a': [1, 2, 3, 4, 5], 'b': ['a', 'b', 'c', 'd', 'e']})
    other_pdf = pd.DataFrame({'a': [6, 7, 8, 9], 'b': ['f', 'g', 'h', 'i']})

    caller_df = get_from_df('caller_df', caller_pdf)
    other_df = get_from_df('other_df', other_pdf)
    result = AppendOperation(
        caller_df=caller_df,
        other_df=other_df,
    ).append().reset_index(drop=False)

    expected = caller_pdf.append(other_pdf).reset_index(drop=False)
    np.testing.assert_equal(expected.values, result.values)


def test_append_w_non_aligned_columns() -> None:
    caller_pdf = pd.DataFrame({'a': [1, 2, 3, 4, 5], 'b': ['a', 'b', 'c', 'd', 'e']})
    other_pdf = pd.DataFrame({'d': [6, 7, 8, 9], 'c': ['f', 'g', 'h', 'i']})

    caller_df = get_from_df('caller_df', caller_pdf)
    other_df = get_from_df('other_df', other_pdf)
    result = AppendOperation(
        caller_df=caller_df,
        other_df=other_df,
    ).append().reset_index(drop=False)

    expected = caller_pdf.append(other_pdf).reset_index(drop=False)
    expected = expected.rename(columns={'index': '_index_0'})

    result_pdf = result.to_pandas()
    pd.testing.assert_frame_equal(expected, result_pdf)


def test_append_w_multiple_indexes() -> None:
    caller_pdf = pd.DataFrame({'a': [1, 2, 3, 4, 5], 'b': ['a', 'b', 'c', 'd', 'e']})
    other_pdf = pd.DataFrame({'d': [6, 7, 8, 9], 'c': ['f', 'g', 'h', 'i']})
    other_pdf['b'] = 0
    other_pdf['e'] = 'a'

    caller_df = get_from_df('caller_df', caller_pdf)

    other_df = get_from_df('other_df', other_pdf)
    other_df = other_df.set_index(['b', 'e'])
    result = AppendOperation(
        caller_df=caller_df,
        other_df=other_df,
    ).append().to_pandas()

    other_pdf = other_pdf.set_index(['b', 'e'])
    expected = caller_pdf.append(other_pdf)

    pd.testing.assert_frame_equal(
        expected.reset_index(drop=True),
        result.reset_index(drop=True),
    )

    # check index values
    for expected_idx, result_idx in zip(expected.index.values, result.index.values):
        if isinstance(expected_idx, tuple):
            assert f'{expected_idx[0]}/{expected_idx[1]}' == result_idx
        else:
            assert str(expected_idx) == result_idx


def test_append_w_ignore_index_n_sort() -> None:
    caller_pdf = pd.DataFrame({'a': [1, 2, 3, 4, 5], 'b': ['a', 'b', 'c', 'd', 'e']})
    other_pdf = pd.DataFrame({'d': [6, 7, 8, 9], 'c': ['f', 'g', 'h', 'i']})

    caller_df = get_from_df('caller_df', caller_pdf)

    other_df = get_from_df('other_df', other_pdf)
    other_df = other_df.set_index(['d'])

    result = AppendOperation(
        caller_df=caller_df,
        other_df=other_df,
        ignore_index=True,
    ).append().to_pandas()

    expected = caller_pdf.append(other_pdf.set_index(['d']), ignore_index=True)
    pd.testing.assert_frame_equal(expected, result)

    result2 = AppendOperation(
        caller_df=caller_df,
        other_df=other_df,
        ignore_index=True,
        sort=True,
    ).append().to_pandas()

    expected2 = caller_pdf.append(other_pdf.set_index(['d']), ignore_index=True, sort=True)
    pd.testing.assert_frame_equal(expected2, result2)
