import pandas as pd
import pytest

from bach import DataFrame
from bach.series.series_multi_level import SeriesNumericInterval


@pytest.fixture()
def interval_data_pdf() -> pd.DataFrame:
    pdf = pd.DataFrame(
        {
            'lower': [0., 0., 3., 5., 1., 2., 3., 4., 5.],
            'upper': [1., 1., 4., 6., 2., 3., 4., 5., 6.],
            'a': [10, 15, 20, 25, 30, 35, 40, 45, 50],
        },
    )
    pdf['bounds'] = '(]'

    return pdf


def test_series_numeric_interval_to_pandas(engine, interval_data_pdf: pd.DataFrame) -> None:
    df = DataFrame.from_pandas(engine=engine, df=interval_data_pdf, convert_objects=True)
    df['range'] = SeriesNumericInterval.from_const(
        base=df,
        name='num_interval',
        value={
            'lower': df['lower'],
            'upper': df['upper'],
            'bounds': df['bounds'],
        }
    )

    expected = pd.DataFrame(
        {
            '_index_0': [0, 1, 2, 3, 4, 5, 6, 7, 8],
            'range': [
                pd.Interval(left=0., right=1., closed='right'),
                pd.Interval(left=0., right=1., closed='right'),
                pd.Interval(left=3., right=4., closed='right'),
                pd.Interval(left=5., right=6., closed='right'),
                pd.Interval(left=1., right=2., closed='right'),
                pd.Interval(left=2., right=3., closed='right'),
                pd.Interval(left=3., right=4., closed='right'),
                pd.Interval(left=4., right=5., closed='right'),
                pd.Interval(left=5., right=6., closed='right'),
            ]
        }
    ).set_index('_index_0')['range']
    result = df['range'].sort_index().to_pandas()
    pd.testing.assert_series_equal(expected, result)


def test_series_numeric_interval_sort_values(engine, interval_data_pdf: pd.DataFrame) -> None:
    df = DataFrame.from_pandas(engine=engine, df=interval_data_pdf, convert_objects=True)
    df['range'] = SeriesNumericInterval.from_const(
        base=df,
        name='num_interval',
        value={
            'lower': df['lower'],
            'upper': df['upper'],
            'bounds': df['bounds'],
        },
    )

    expected = pd.DataFrame(
        {
            'range': [
                pd.Interval(left=0., right=1., closed='right'),
                pd.Interval(left=0., right=1., closed='right'),
                pd.Interval(left=1., right=2., closed='right'),
                pd.Interval(left=2., right=3., closed='right'),
                pd.Interval(left=3., right=4., closed='right'),
                pd.Interval(left=3., right=4., closed='right'),
                pd.Interval(left=4., right=5., closed='right'),
                pd.Interval(left=5., right=6., closed='right'),
                pd.Interval(left=5., right=6., closed='right'),
            ]
        }
    )['range']
    result = df.reset_index()['range'].sort_values().to_pandas()
    pd.testing.assert_series_equal(expected, result, check_index=False, check_index_type=False)


def test_series_numeric_interval_append(engine, interval_data_pdf: pd.DataFrame) -> None:
    df = DataFrame.from_pandas(engine=engine, df=interval_data_pdf, convert_objects=True)
    df['range_1'] = SeriesNumericInterval.from_const(
        base=df,
        name='num_interval',
        value={
            'lower': df['lower'],
            'upper': df['upper'],
            'bounds': df['bounds'],
        },
    )
    df['range_2'] = SeriesNumericInterval.from_const(
        base=df,
        name='num_interval',
        value={
            'lower': df['lower'] + 1,
            'upper': df['upper'] + 2,
            'bounds': df['bounds'],
        },
    )
    result = df['range_1'].append(df['range_2'])
    print(result)