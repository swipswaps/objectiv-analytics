import numpy as np
import pandas as pd

from bach import Series
from bach.describe import SupportedStats
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data, get_from_df


def test_categorical_describe() -> None:
    series = get_bt_with_test_data()['city']
    result = series.describe()
    assert isinstance(result, Series)
    assert_equals_data(
        result,
        expected_columns=[
            'stat',
            'city',
        ],
        expected_data=[
            [SupportedStats.COUNT.value, '3'],
            [SupportedStats.UNIQUE.value, '3'],
            [SupportedStats.FREQ.value, 'Drylts'],
        ],
    )


def test_numerical_describe() -> None:
    series = get_bt_with_test_data()['skating_order']
    result = series.describe(percentiles=[0.5])
    assert isinstance(result, Series)

    expected = pd.Series(
        index=pd.Index(['count', 'mean', 'std', 'min', 'max', '0.5'], name='stat'),
        data=[3., 2., 1., 1., 3., 2.],
        name='skating_order',
    )
    pd.testing.assert_series_equal(expected, result.to_pandas())


def test_describe_datetime() -> None:
    p_series = pd.Series(
        data=[np.datetime64("2000-01-01"), np.datetime64("2010-01-01"), np.datetime64("2010-01-01")],
        name='dt',
    )
    df = get_from_df(table='describe_table', df=p_series.to_frame())

    result = df.dt.describe()

    expected = pd.Series(
        index=pd.Index(['count', 'unique', 'first', 'last'], name='stat'),
        data=['3', '2', '2000-01-01 00:00:00', '2010-01-01 00:00:00'],
        name='dt',
    )
    pd.testing.assert_series_equal(expected, result.to_pandas())


def test_describe_boolean() -> None:
    p_series = pd.Series(
        data=[True, True, True, False],
        name='bool_column',
    )
    df = get_from_df(table='describe_table', df=p_series.to_frame())

    result = df.bool_column.describe()
    expected = pd.Series(
        index=pd.Index(['count', 'unique', 'freq'], name='stat'),
        data=['4', '2', 'true'],
        name='bool_column',
    )

    pd.testing.assert_series_equal(expected, result.to_pandas())
