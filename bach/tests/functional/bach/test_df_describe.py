"""
Copyright 2021-2022 Objectiv B.V.
"""
import numpy as np
import pandas as pd

from bach import DataFrame
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data, get_from_df


def test_df_categorical_describe() -> None:
    df = get_bt_with_test_data()[['city', 'municipality']]
    result = df.describe()
    assert isinstance(result, DataFrame)
    assert_equals_data(
        result,
        expected_columns=[
            '__stat',
            'city',
            'municipality',
        ],
        expected_data=[
            ['count', '3', '3'],
            ['min', 'Drylts', 'Leeuwarden'],
            ['max', 'Snits', 'Súdwest-Fryslân'],
            ['nunique', '3', '2'],
            ['mode', 'Drylts', 'Súdwest-Fryslân'],
        ],
    )


def test_df_numerical_describe() -> None:
    df = get_bt_with_test_data()[['city', 'skating_order', 'inhabitants']]
    result = df.describe(percentiles=[0.5])
    assert isinstance(result, DataFrame)

    result = result.reset_index(drop=False)
    expected_df = pd.DataFrame(
        data=[
            ['count', 3., 3.],
            ['mean', 2., 43353.333],
            ['std', 1., 46009.9666],
            ['min', 1., 3055.],
            ['max', 3., 93485.],
            ['nunique', 3., 3.],
            ['mode', 1., 3055.],
            ['0.5', 2., 33520.],
        ],
        columns=[
            '__stat',
            'skating_order',
            'inhabitants',
        ],
    )
    numerical_columns = expected_df.columns[1:]
    expected_df[numerical_columns] = expected_df[numerical_columns].round(2)

    np.testing.assert_equal(expected_df.to_numpy(), result.to_numpy())

    df2 = df.copy_override()
    df2['inhabitants'] = df['inhabitants'].astype('float64')
    result2 = df2.describe(include=['int64'], exclude=['float64'], percentiles=[0.5])
    result2 = result2.reset_index(drop=False)
    np.testing.assert_equal(
        expected_df[['__stat', 'skating_order']].to_numpy(),
        result2.to_numpy(),
    )


def test_include_categorical_n_numerical() -> None:
    df = get_bt_with_test_data()
    df['inhabitants'] = df['inhabitants'].astype('float64')
    include_dtypes = ['string', 'float64', 'int64']
    result = df.describe(include=include_dtypes)
    result = result.reset_index(drop=False)

    expected_df = pd.DataFrame(
        data=[
            ['count', 3., '3', '3', 3., 3.],
            ['mean', 2., None, None, 43353.33, 1336.33],
            ['std', 1., None, None, 46009.97, 103.98],
            ['min', 1., 'Drylts', 'Leeuwarden', 3055., 1268.],
            ['max', 3., 'Snits', 'Súdwest-Fryslân', 93485., 1456.],
            ['nunique', 3., '3', '2', 3., 3.],
            ['mode', 1., 'Drylts', 'Súdwest-Fryslân', 3055., 1268.],
            ['0.25', 1.5, None, None, 18287.5, 1276.5],
            ['0.5', 2., None, None, 33520.,  1285.],
            ['0.75', 2.5, None, None, 63502.5, 1370.5],
        ],
        columns=[
            '__stat', 'skating_order', 'city', 'municipality', 'inhabitants', 'founding',
        ],
    )

    pd.testing.assert_frame_equal(result.to_pandas(), expected_df)


def test_describe_datetime() -> None:
    pdf = pd.DataFrame(
        data=[
            [np.datetime64("2000-01-01")], [np.datetime64("2010-01-01")], [np.datetime64("2010-01-01")],
        ],
        columns=['column'],
    )
    df = get_from_df(table='describe_table', df=pdf)

    result = df.describe()
    result = result.reset_index(drop=False)

    expected_df = pd.DataFrame(
        data=[
            ['count', '3'],
            ['min', '2000-01-01 00:00:00'],
            ['max', '2010-01-01 00:00:00'],
            ['nunique', '2'],
            ['mode', '2010-01-01 00:00:00'],
        ],
        columns=['__stat', 'column'],
    )
    pd.testing.assert_frame_equal(expected_df, result.to_pandas())


def test_describe_date() -> None:
    pdf = pd.DataFrame(
        data=[
            [np.datetime64("2000-01-01")], [np.datetime64("2010-01-01")], [np.datetime64("2010-01-01")],
        ],
        columns=['column'],
    )
    df = get_from_df(table='describe_table', df=pdf)
    df['column'] = df['column'].astype('date')

    result = df.describe()
    result = result.reset_index(drop=False)

    expected_df = pd.DataFrame(
        data=[
            ['count', '3'],
            ['min', '2000-01-01'],
            ['max', '2010-01-01'],
            ['nunique', '2'],
            ['mode', '2010-01-01'],
        ],
        columns=['__stat', 'column'],
    )
    pd.testing.assert_frame_equal(expected_df, result.to_pandas())


def test_describe_time() -> None:
    pdf = pd.DataFrame(
        data=[
            ["11:00:01"], ["11:00:01"], ["13:37"],
        ],
        columns=['column'],
    )
    df = get_from_df(table='describe_table', df=pdf)
    df['column'] = df['column'].astype('time')

    result = df.describe()
    result = result.reset_index(drop=False)

    expected_df = pd.DataFrame(
        data=[
            ['count', '3'],
            ['min', '11:00:01'],
            ['max', '13:37:00'],
            ['nunique', '2'],
            ['mode', '11:00:01'],
        ],
        columns=['__stat', 'column'],
    )
    pd.testing.assert_frame_equal(expected_df, result.to_pandas())


def test_describe_boolean() -> None:
    pdf = pd.DataFrame(
        data=[
            [True], [False], [True],
        ],
        columns=['column'],
    )
    df = get_from_df(table='describe_table', df=pdf)

    result = df.describe()
    result = result.reset_index(drop=False)

    expected_df = pd.DataFrame(
        data=[
            ['count', '3'],
            ['min', 'false'],
            ['max', 'true'],
            ['nunique', '2'],
            ['mode', 'true'],
        ],
        columns=['__stat', 'column'],
    )
    pd.testing.assert_frame_equal(expected_df, result.to_pandas())


def test_describe_json() -> None:
    pdf = pd.DataFrame(
        data=[
            ['"a string"'],
            ['"other string"'],
            ['{"key": "value", "another key": "value"}'],
            ['"a string"'],
        ],
        columns=['column'],
    )
    df = get_from_df(table='describe_table', df=pdf)
    df['column'] = df['column'].astype('json')

    result = df.describe()
    result = result.reset_index(drop=False)

    expected_df = pd.DataFrame(
        data=[
            ['count', '4'],
            ['nunique', '3'],
            ['mode', '"a string"'],
        ],
        columns=['__stat', 'column'],
    )
    pd.testing.assert_frame_equal(expected_df, result.to_pandas())
