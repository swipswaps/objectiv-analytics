import pandas as pd

from tests.functional.bach.test_data_and_utils import get_from_df


def test_basic_indexing() -> None:
    pdf = pd.DataFrame(
        {
            'A': ['a', 'b', 'c', 'd', 'e'],
            'B': [0, 1, 2, 3, 4],
            'C': [5, 6, 7, 8, 9],
        },
    )
    df = get_from_df('indexing_df', pdf)
    df = df.set_index('A')
    df.sort_index().loc['b':'d']