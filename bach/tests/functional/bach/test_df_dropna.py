import pandas as pd
import numpy as np

from tests.functional.bach.test_data_and_utils import get_from_df, assert_equals_data

DATA = {
    "name": ['Alfred', 'Batman', 'Catwoman'],
    "toy": [np.nan, 'Batmobile', 'Bullwhip'],
    "born": [pd.NaT, pd.Timestamp("1940-04-25"), pd.NaT]
}


def test_basic_dropna() -> None:
    pdf = pd.DataFrame(DATA)

    df = get_from_df('dropna_table', pdf)
    result = df.dropna()
    pd.testing.assert_frame_equal(
        pdf.dropna(),
        result.to_pandas(),
        check_names=False,
    )

    df_inplace = df.copy()
    result_inplace = df_inplace.dropna(inplace=True)
    assert result_inplace is None
    assert_equals_data(
        df_inplace,
        expected_columns=['_index_0', 'name', 'toy', 'born'],
        expected_data=[[1, 'Batman', 'Batmobile', pd.Timestamp("1940-04-25")]],
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

    df_inplace = df.copy()
    result_inplace = df_inplace.dropna(how='all', inplace=True)
    assert result_inplace is None
    assert_equals_data(
        df_inplace,
        expected_columns=['_index_0', 'name', 'toy', 'born'],
        expected_data=[
            [0, 'Alfred', None, None],
            [1, 'Batman', 'Batmobile', pd.Timestamp("1940-04-25")],
            [2, 'Catwoman', 'Bullwhip', None],
        ],
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

    df_inplace = df.copy()
    result_inplace = df_inplace.dropna(thresh=2, inplace=True)
    assert result_inplace is None
    assert_equals_data(
        df_inplace,
        expected_columns=['_index_0', 'name', 'toy', 'born'],
        expected_data=[
            [1, 'Batman', 'Batmobile', pd.Timestamp("1940-04-25")],
            [2, 'Catwoman', 'Bullwhip', None],
        ],
    )
