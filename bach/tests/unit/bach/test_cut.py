import numpy as np
import pandas as pd

from bach.operations.cut import CutOperation
from tests.functional.bach.test_data_and_utils import get_from_df


def test_cut_operation() -> None:
    p_series = pd.Series(range(100), name='a')
    series = get_from_df('cut_df', p_series.to_frame()).a

    expected = pd.cut(p_series, bins=10)
    result = CutOperation(series=series, bins=10)()

    for exp, res in zip(expected.to_numpy(), result.to_numpy()):
        assert exp.left == float(res.lower)
        assert exp.right == float(res.upper)
