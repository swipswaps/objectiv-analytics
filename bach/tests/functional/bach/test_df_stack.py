import pandas as pd
import pytest

from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data


def test_stack() -> None:
    bt = get_bt_with_test_data(full_data_set=True)[['city', 'municipality', 'inhabitants']]
    bt = bt.groupby(['municipality', 'city'])['inhabitants'].sum()

    unstacked_bt = bt.unstack()

    pbt = unstacked_bt.to_pandas()
    expected = pbt.stack()
    result = unstacked_bt.stack()

    pd.testing.assert_series_equal(
        expected.sort_index(),
        result.sort_index().to_pandas(),
        check_names=False,
        check_dtype=False,
    )
    assert_equals_data(
        result.sort_index(),
        expected_columns=['municipality', '__stacked_index', '__stacked'],
        expected_data=[
            ['De Friese Meren', 'Sleat', 700],
            ['Harlingen', 'Harns', 14740],
            ['Leeuwarden', 'Ljouwert', 93485],
            ['Noardeast-Fryslân', 'Dokkum', 12675],
            ['Súdwest-Fryslân', 'Boalsert', 10120],
            ['Súdwest-Fryslân', 'Drylts', 3055],
            ['Súdwest-Fryslân', 'Hylpen', 870],
            ['Súdwest-Fryslân', 'Snits', 33520],
            ['Súdwest-Fryslân', 'Starum', 960],
            ['Súdwest-Fryslân', 'Warkum', 4440],
            ['Waadhoeke', 'Frjentsjer', 12760],
        ],
    )

    expected_w_na = pbt.stack(dropna=False)
    result_w_na = unstacked_bt.stack(dropna=False)
    pd.testing.assert_series_equal(
        expected_w_na.sort_index(),
        result_w_na.sort_index().to_pandas(),
        check_names=False,
        check_dtype=False,
    )


def test_stack_error() -> None:
    bt = get_bt_with_test_data(full_data_set=True)[['city', 'municipality', 'inhabitants']]
    bt = bt.set_index(['city', 'municipality'])['inhabitants'].unstack()

    with pytest.raises(NotImplementedError, match='column axis supports only one level.'):
        bt.stack(level=0)
