from decimal import Decimal

import numpy as np
import pandas as pd
from psycopg2._range import NumericRange

from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data


def test_series_cut() -> None:
    bins = 4
    inhabitants = get_bt_with_test_data(full_data_set=True)['inhabitants']

    # right == true
    result_right = inhabitants.cut(bins=bins).sort_index()
    bounds_right = '(]'
    bin1_right = NumericRange(Decimal('607.215'),  Decimal('23896.25'), bounds=bounds_right)
    bin2_right = NumericRange(Decimal('23896.25'),  Decimal('47092.5'), bounds=bounds_right)
    bin4_right = NumericRange(Decimal('70288.75'), Decimal('93485'), bounds=bounds_right)
    assert_equals_data(
        result_right,
        expected_columns=['inhabitants', 'range'],
        expected_data=[
            [700, bin1_right],
            [870, bin1_right],
            [960, bin1_right],
            [3055, bin1_right],
            [4440, bin1_right],
            [10120, bin1_right],
            [12675, bin1_right],
            [12760, bin1_right],
            [14740, bin1_right],
            [33520, bin2_right],
            [93485, bin4_right],
        ],
    )

    # right == false
    result_not_right = inhabitants.cut(bins=bins, right=False).sort_index()
    bounds_not_right = '[)'
    bin1_not_right = NumericRange(Decimal('700'),  Decimal('23896.25'), bounds=bounds_not_right)
    bin2_not_right = NumericRange(Decimal('23896.25'),  Decimal('47092.5'), bounds=bounds_not_right)
    bin4_not_right = NumericRange(Decimal('70288.75'), Decimal('93577.785'), bounds=bounds_not_right)
    assert_equals_data(
        result_not_right,
        expected_columns=['inhabitants', 'range'],
        expected_data=[
            [700, bin1_not_right],
            [870, bin1_not_right],
            [960, bin1_not_right],
            [3055, bin1_not_right],
            [4440, bin1_not_right],
            [10120, bin1_not_right],
            [12675, bin1_not_right],
            [12760, bin1_not_right],
            [14740, bin1_not_right],
            [33520, bin2_not_right],
            [93485, bin4_not_right],
        ],
    )

    inhabitants_pdf = inhabitants.to_pandas()

    to_assert = [
        (pd.cut(inhabitants_pdf, bins=bins).sort_values(), result_right),
        (pd.cut(inhabitants_pdf, bins=bins, right=False).sort_values(), result_not_right),
    ]
    for expected_pdf, result in to_assert:
        for exp, res in zip(expected_pdf.to_numpy(), result.to_numpy()):
            np.testing.assert_almost_equal(exp.left, float(res.lower), decimal=2)
            np.testing.assert_almost_equal(exp.right, float(res.upper), decimal=2)
