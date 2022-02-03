import pandas as pd

from tests.functional.bach.test_data_and_utils import get_from_df


def test_series_values_counts_w_bins() -> None:
    p_series = pd.Series([1, 1, 2, 3, 6, 7, 8], name='a')
    series = get_from_df('value_counts_df', p_series.to_frame()).a
    result = series.value_counts(bins=3)
    print(result)

