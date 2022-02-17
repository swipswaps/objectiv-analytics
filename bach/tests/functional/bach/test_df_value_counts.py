import numpy as np
import pytest

from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data, \
    get_bt_with_railway_data


def test_value_counts_basic():
    bt = get_bt_with_test_data()[['municipality']]
    result = bt.value_counts()

    np.testing.assert_equal(
        bt.to_pandas().value_counts().to_numpy(),
        result.to_numpy(),
    )

    assert_equals_data(
        result.to_frame(),
        expected_columns=['municipality', 'value_counts'],
        expected_data=[
            ['Súdwest-Fryslân', 2],
            ['Leeuwarden', 1]
        ],
    )

    result_normalized = bt.value_counts(normalize=True)
    np.testing.assert_almost_equal(
        bt.to_pandas().value_counts(normalize=True).to_numpy(),
        result_normalized.to_numpy(),
        decimal=2,
    )
    assert_equals_data(
        result_normalized.to_frame(),
        expected_columns=['municipality', 'value_counts'],
        expected_data=[
            ['Súdwest-Fryslân', 2 / 3],
            ['Leeuwarden', 1 / 3]
        ],
    )


def test_value_counts_w_subset():
    bt = get_bt_with_railway_data()
    result = bt.value_counts(subset=['town', 'platforms'])
    np.testing.assert_equal(
        bt.to_pandas().value_counts(subset=['town', 'platforms']).to_numpy(),
        result.to_numpy(),
    )
    assert_equals_data(
        result.to_frame().sort_index(),
        expected_columns=['town', 'platforms', 'value_counts'],
        expected_data=[
            ['Drylts', 1, 1],
            ['It Hearrenfean', 1, 1],
            ['It Hearrenfean', 2, 1],
            ['Ljouwert', 1, 1],
            ['Ljouwert', 4, 1],
            ['Snits', 2, 2],
        ],
    )

    result_normalized = bt.value_counts(subset=['town', 'platforms'], normalize=True)
    np.testing.assert_almost_equal(
        bt.to_pandas().value_counts(subset=['town', 'platforms'], normalize=True).to_numpy(),
        result_normalized.to_numpy(),
        decimal=2,
    )
    assert_equals_data(
        result_normalized.to_frame().sort_index(),
        expected_columns=['town', 'platforms', 'value_counts'],
        expected_data=[
            ['Drylts', 1, 1 / 7],
            ['It Hearrenfean', 1, 1 / 7],
            ['It Hearrenfean', 2, 1 / 7],
            ['Ljouwert', 1, 1 / 7],
            ['Ljouwert', 4, 1 / 7],
            ['Snits', 2, 2 / 7],
        ],
    )


def test_value_counts_w_groupby() -> None:
    bt = get_bt_with_railway_data()[['town', 'platforms', 'station_id']].reset_index(drop=True)
    result = bt.groupby(['town', 'platforms']).value_counts()
    assert_equals_data(
        result.to_frame().sort_index(),
        expected_columns=['town', 'platforms', 'station_id', 'value_counts'],
        expected_data=[
            ['Drylts', 1, 1, 1],
            ['It Hearrenfean', 1, 2, 1],
            ['It Hearrenfean', 2, 3, 1],
            ['Ljouwert', 1, 5, 1],
            ['Ljouwert', 4, 4, 1],
            ['Snits', 2, 6, 1],
            ['Snits', 2, 7, 1],
        ],
    )

    result_normalized = bt.groupby(['town', 'platforms']).value_counts(normalize=True)
    assert_equals_data(
        result_normalized.to_frame().sort_index(),
        expected_columns=['town', 'platforms', 'station_id', 'value_counts'],
        expected_data=[
            ['Drylts', 1, 1, 1 / 7],
            ['It Hearrenfean', 1, 2, 1 / 7],
            ['It Hearrenfean', 2, 3, 1 / 7],
            ['Ljouwert', 1, 5, 1 / 7],
            ['Ljouwert', 4, 4, 1 / 7],
            ['Snits', 2, 6, 1 / 7],
            ['Snits', 2, 7, 1 / 7],
        ],
    )


def test_subset_error() -> None:
    with pytest.raises(ValueError, match='subset contains invalid series.'):
        get_bt_with_railway_data().value_counts(subset=['random'])
