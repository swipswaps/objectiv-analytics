import pandas as pd

from bach import Series
from bach.operations.cut import CutOperation
from tests.functional.bach.test_data_and_utils import get_from_df


def compare_boundaries(expected: pd.Series, result: Series) -> None:
    for exp, res in zip(expected.to_numpy(), result.to_numpy()):
        assert exp.left == float(res.lower)
        assert exp.right == float(res.upper)


def test_cut_operation() -> None:
    p_series = pd.Series(range(100), name='a')
    series = get_from_df('cut_df', p_series.to_frame()).a

    expected = pd.cut(p_series, bins=10)
    result = CutOperation(series=series, bins=10)()
    compare_boundaries(expected, result)

    expected_wo_right = pd.cut(p_series, bins=10, right=False)
    result_wo_right = CutOperation(series, bins=10, right=False)()
    compare_boundaries(expected_wo_right, result_wo_right)
