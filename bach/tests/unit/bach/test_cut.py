import numpy as np
import pandas as pd

from bach import Series
from bach.operations.cut import CutOperation
from tests.functional.bach.test_data_and_utils import get_from_df

PD_TESTING_SETTINGS = {
    'check_dtype': False,
    'check_exact': False,
    'atol': 1e-3,
}


def compare_boundaries(expected: pd.Series, result: Series) -> None:
    for exp, res in zip(expected.to_numpy(), result.to_numpy()):
        np.testing.assert_almost_equal(exp.left, float(res.lower), decimal=2)
        np.testing.assert_almost_equal(exp.right, float(res.upper), decimal=2)


def test_cut_operation() -> None:
    p_series = pd.Series(range(100), name='a')
    series = get_from_df('cut_df', p_series.to_frame()).a

    expected = pd.cut(p_series, bins=10)
    result = CutOperation(series=series, bins=10)()
    compare_boundaries(expected, result)

    expected_wo_right = pd.cut(p_series, bins=10, right=False)
    result_wo_right = CutOperation(series, bins=10, right=False)()
    compare_boundaries(expected_wo_right, result_wo_right)


def test_cut_operation_calculate_bucket_properties() -> None:

    bins = 2
    # min != max
    p_series_neq = pd.Series(data=[1, 3, 5, 16, 2, 20], name='a')
    series_neq = get_from_df('cut_df', p_series_neq.to_frame()).a
    result_neq = CutOperation(series=series_neq, bins=bins)._calculate_bucket_properties()
    expected_neq = pd.DataFrame(
        data={
            'a_min': [1],  # min(a) - min_adjustment
            'a_max': [20],  # max(a) + max_adjustment
            'min_adjustment': [0],  # min(a) != max(a)
            'max_adjustment': [0],  # min(a) != max(a)
            'bin_adjustment': [0.019],  # (max(a) - min(a)) * range_adjustment
            'step': [9.5],  # (max(a) - min(a)) / bins
        },
    )
    pd.testing.assert_frame_equal(expected_neq, result_neq.to_pandas(), check_dtype=False)

    # min == max
    p_series_eq = pd.Series(data=[2, 2], name='a')
    series_eq = get_from_df('cut_df', p_series_eq.to_frame()).a
    result_eq = CutOperation(series=series_eq, bins=bins)._calculate_bucket_properties()
    expected_eq = pd.DataFrame(
        data={
            'a_min': [1.998],
            'a_max': [2.002],
            'min_adjustment': [0.002],  # if min(a) == max(a): range_adjustment * abs(min(a))
            'max_adjustment': [0.002],  # if min(a) == max(a): range_adjustment * abs(max(a))
            'bin_adjustment': [0.],
            'step': [0.002],
        },
    )
    pd.testing.assert_frame_equal(expected_eq, result_eq.to_pandas(), **PD_TESTING_SETTINGS)

    # min == max == 0
    p_series_zero = pd.Series(data=[0, 0], name='a')
    series_zero = get_from_df('cut_df', p_series_zero.to_frame()).a
    result_zero = CutOperation(series=series_zero, bins=bins)._calculate_bucket_properties()
    expected_zero = pd.DataFrame(
        data={
            'a_min': [-0.001],
            'a_max': [0.001],
            'min_adjustment': [0.001],  # if min(a) == max(a) == 0: range_adjustment
            'max_adjustment': [0.001],  # if min(a) == max(a) == 0: range_adjustment
            'bin_adjustment': [0.],
            'step': [0.001],
        },
    )
    pd.testing.assert_frame_equal(expected_zero, result_zero.to_pandas(), **PD_TESTING_SETTINGS)


def test_cut_calculate_buckets() -> None:
    bins = 3
    p_series = pd.Series(data=[1, 1, 2, 3, 4, 5, 6, 7, 8], name='a')
    series = get_from_df('cut_df', p_series.to_frame()).a

    result = CutOperation(series=series, bins=bins)._calculate_buckets().sort_values()
    assert isinstance(result, Series)
    expected = pd.Series(
        data=[1, 1, 1, 1, 2, 2, 3, 3, 3],
        name='bucket',
    )

    pd.testing.assert_series_equal(
        expected, result.to_pandas(), check_index_type=False, check_names=False,
    )


def test_cut_calculate_adjustments() -> None:
    pdf = pd.DataFrame(data={'min': [1], 'max': [100]})
    df = get_from_df('cut_df', pdf)
    to_adjust = df['min']
    to_compare = df['max']
    result = CutOperation(series=df['min'], bins=1)._calculate_adjustments(to_adjust, to_compare)
    assert isinstance(result, Series)

    result_case_sql = result.expression.to_sql()
    expected_case_sql = (
        'case when "max" = "min" then\n'
        'case when "min" != 0 then 0.001 * abs("min") else 0.001 end\n'
        'else 0 end'
    )

    assert expected_case_sql == result_case_sql


def test_cut_calculate_bucket_ranges() -> None:
    bins = 3
    p_series = pd.Series(data=[1, 1, 2, 3, 4, 5, 6, 7, 8], name='a')
    series = get_from_df('cut_df', p_series.to_frame()).a

    result = CutOperation(series=series, bins=bins)._calculate_bucket_ranges().sort_values(by='bucket')
    expect = pd.DataFrame(
        data={
            'bucket': [1, 2, 3],
            'range': [pd.Interval(0.993, 3.333), pd.Interval(3.333, 5.667), pd.Interval(5.667, 8)],
            'lower_bound': [0.993, 3.333, 5.667],
            'upper_bound': [3.333, 5.667, 8.],
        }
    )
    compare_boundaries(expect.range, result.range.sort_values())
    columns_to_compare = ['bucket', 'lower_bound', 'upper_bound']
    pd.testing.assert_frame_equal(
        expect[columns_to_compare],
        result[columns_to_compare].to_pandas(),
        **PD_TESTING_SETTINGS,
    )
