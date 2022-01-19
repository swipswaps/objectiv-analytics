import pandas as pd

from bach.append import AppendOperation
from tests.functional.bach.test_data_and_utils import get_from_df


def test_append() -> None:
    caller_pdf = pd.DataFrame({'b': [1, 2, 3, 4, 5], 'e': ['a', 'b', 'c', 'd', 'e']})
    caller_df = get_from_df('caller_df', caller_pdf)

    other_pdf = pd.DataFrame({'a': [6, 7, 8, 9, 10, 16], 'c': [11, 12, 13, 14, 15, 17]})
    other_pdf['b'] = 0
    other_pdf['d'] = 0
    other_df = get_from_df('other_df', other_pdf)
    other_df = other_df.set_index(['c', 'd'])
    result = AppendOperation(
        caller_df=caller_df,
        other_df=other_df,
        ignore_index=True,
        sort=True
    ).append()

