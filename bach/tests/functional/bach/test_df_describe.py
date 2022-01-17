import numpy as np
import pandas as pd

from bach import DataFrame
from bach.describe import DataFrameDescriber, SupportedStats
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data


def test_df_categorical_describe() -> None:
    df = get_bt_with_test_data()[['city', 'municipality']]
    result = df.describe()
    assert isinstance(result, DataFrame)
    assert_equals_data(
        result,
        expected_columns=[
            'stat',
            'city',
            'municipality',
        ],
        expected_data=[
            [SupportedStats.COUNT.value, 3, 3],
            [SupportedStats.UNIQUE.value, 3, 2],
        ],
    )


def test_df_numerical_describe() -> None:
    df = get_bt_with_test_data()[['city', 'skating_order', 'inhabitants']]
    result = df.describe()
    assert isinstance(result, DataFrame)

    result = result.reset_index(drop=False)
    expected_df = pd.DataFrame(
        data=[
            ['count', 3.0, 3.0],
            ['mean', 2.0, 43353.333],
            ['std', 1.0, 46009.9666],
            ['min', 1.0, 3055.0],
            ['max', 3.0, 93485.0],
        ],
        columns=[
            'stat',
            'skating_order',
            'inhabitants',
        ],
    )
    numerical_columns = expected_df.columns[1:]
    expected_df[numerical_columns] = expected_df[numerical_columns].round(DataFrameDescriber.RESULT_DECIMALS)

    np.testing.assert_equal(expected_df.values, result.values)

    df2 = df.copy_override()
    df2['inhabitants'] = df['inhabitants'].astype('float64')
    result2 = df2.describe(include=['int64'], exclude=['float64'])
    result2 = result2.reset_index(drop=False)
    np.testing.assert_equal(expected_df[['stat', 'skating_order']].values, result2.values)


