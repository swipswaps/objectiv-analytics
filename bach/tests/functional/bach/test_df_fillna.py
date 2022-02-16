import numpy as np
import pandas as pd

from tests.functional.bach.test_data_and_utils import get_from_df


def test_basic_fillna() -> None:
    pdf = pd.DataFrame(
        [
            [3, 4, np.nan, 1],
            [np.nan, 3, np.nan, 4],
            [np.nan, 2, np.nan, 0],
            [np.nan, np.nan, np.nan, np.nan],
            [1, np.nan, np.nan, np.nan],
            [np.nan, np.nan, np.nan, np.nan],
            [np.nan, np.nan, 1, np.nan],
        ],
        columns=list("ABCD"),
    )
    df = get_from_df('test_df_fillna', pdf)

    series_a = df.all_series['A']
    series_a = series_a.sort_values()
    series_a.ffill()