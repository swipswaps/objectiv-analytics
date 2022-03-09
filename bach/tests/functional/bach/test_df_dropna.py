import pandas as pd
import numpy as np

from tests.functional.bach.test_data_and_utils import get_from_df

DATA = {
    "name": ['Alfred', 'Batman', 'Catwoman'],
    "toy": [np.nan, 'Batmobile', 'Bullwhip'],
    "born": [pd.NaT, pd.Timestamp("1940-04-25"), pd.NaT]
}


def test_dropna_w_nan() -> None:
    pdf = pd.DataFrame(
        {
            'a': ['a', 'b', None],
        },
    )
    df1 = get_from_df('dropna_table', pdf)
    df2 = df1.copy()
    df1['b'] = float(np.nan)
    df2['b'] = pd.Series([1, 2, 3])
    df = df1.append(df2)

    pdf2 = pd.DataFrame(
        {
            'a': ['a', 'b', None, 'a', 'b', None],
            'b': [np.nan, np.nan, np.nan, 1, 2, 3],
        },
    )
    expected = pdf2.dropna()
    result = df.dropna()
    pd.testing.assert_frame_equal(
        expected.reset_index(drop=True),
        result.to_pandas(),
        check_names=False,
    )

    expected_w_thresh = pdf2.dropna(thresh=2)
    result_w_thresh = df.dropna(thresh=2)
    pd.testing.assert_frame_equal(
        expected_w_thresh.reset_index(drop=True),
        result_w_thresh.to_pandas(),
        check_names=False,
    )


def test_basic_dropna() -> None:
    pdf = pd.DataFrame(DATA)

    df = get_from_df('dropna_table', pdf)
    result = df.dropna()
    pd.testing.assert_frame_equal(
        pdf.dropna(),
        result.to_pandas(),
        check_names=False,
    )


def test_dropna_all() -> None:
    pdf = pd.DataFrame(DATA)

    df = get_from_df('dropna_table', pdf)
    result = df.dropna(how='all')
    pd.testing.assert_frame_equal(
        pdf.dropna(how='all'),
        result.to_pandas(),
        check_names=False,
    )


def test_dropna_thresh() -> None:
    pdf = pd.DataFrame(DATA)

    df = get_from_df('dropna_table', pdf)
    result = df.dropna(thresh=2)
    pd.testing.assert_frame_equal(
        pdf.dropna(thresh=2),
        result.to_pandas(),
        check_names=False,
    )
