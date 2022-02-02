import numpy as np
import pandas as pd

from bach.operations.cut import CutOperation
from tests.functional.bach.test_data_and_utils import get_from_df


def test_cut_operation() -> None:
    p_series = pd.Series([2, 4, 6, 8, 10], name='a')
    series = get_from_df('cut_df', p_series.to_frame()).a

    expected = pd.cut(p_series, bins=3)
    result = CutOperation(series=series, bins=3)()

    print('hola')