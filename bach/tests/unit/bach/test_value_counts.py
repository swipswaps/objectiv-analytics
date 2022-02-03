import numpy as np
import pandas as pd

from bach.operations.value_counts import DataFrameValueCountsOperation, SeriesValueCountsOperation
from tests.functional.bach.test_data_and_utils import get_from_df

DATA = {
    'gender': ['male', 'male', 'female', 'male', 'female', 'male'],
    'education': ['low', 'medium', 'high', 'low', 'high', 'low'],
    'country': ['US', 'FR', 'US', 'FR', 'FR', 'FR'],
}


def test_df_basic_value_counts() -> None:
    pdf = pd.DataFrame(DATA)
    df = get_from_df('value_counts_df', pdf)

    result = DataFrameValueCountsOperation(obj=df)()
    np.testing.assert_equal(pdf.value_counts().to_numpy(), result.to_numpy())


def test_df_basic_value_counts() -> None:
    pdf = pd.DataFrame(DATA)
    df = get_from_df('value_counts_df', pdf)

    result = DataFrameValueCountsOperation(obj=df)()
    np.testing.assert_equal(pdf.value_counts().to_numpy(), result.to_numpy())


def test_df_value_counts_w_subset_normalize() -> None:
    subset = ['gender', 'education']
    pdf = pd.DataFrame(DATA)
    df = get_from_df('value_counts_df', pdf)

    result = DataFrameValueCountsOperation(obj=df, subset=subset, normalize=True)()

    pd.testing.assert_series_equal(
        pdf.value_counts(subset, normalize=True),
        result.to_pandas(),
        check_names=False,
    )


def test_df_value_counts_w_groupby() -> None:
    ...


def test_series_values_counts_w_bins() -> None:
    p_series = pd.Series(range(100), name='a')
    series = get_from_df('value_counts_df', p_series.to_frame()).a
    result = SeriesValueCountsOperation(
        obj=series,
        bins=10,
    )()
    print(result)

