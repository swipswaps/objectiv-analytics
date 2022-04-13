from sklearn.preprocessing import StandardScaler

from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data
import numpy as np


def test_standard_scale() -> None:
    numerical_cols = ['skating_order', 'inhabitants', 'founding']
    all_cols = ['city'] + numerical_cols
    bt = get_bt_with_test_data(full_data_set=True)[all_cols]

    pdf = bt.to_pandas()

    so_values = bt.skating_order.to_numpy()
    so_avg = np.mean(so_values)
    so_std = np.var(so_values)
    so_scale = so_std ** 0.5

    inhbt_values = bt.inhabitants.to_numpy()
    inhbt_avg = np.mean(inhbt_values)
    inhbt_std = np.var(inhbt_values)
    inhbt_scale = inhbt_std ** 0.5

    fnd_values = bt.founding.to_numpy()
    fnd_avg = np.mean(fnd_values)
    fnd_std = np.var(fnd_values)
    fnd_scale = fnd_std ** 0.5

    expected_w_mean_std = StandardScaler(with_mean=True, with_std=True).fit_transform(pdf[numerical_cols])
    result_w_mean_std = bt.scale()

    np.testing.assert_almost_equal(expected_w_mean_std, result_w_mean_std[numerical_cols].to_numpy(), decimal=4)

    expected_data_w_mean_std = [
        [1, 'Ljouwert', (1 - so_avg) / so_scale, (93485 - inhbt_avg) / inhbt_scale, (1285 - fnd_avg) / fnd_scale],
        [2, 'Snits', (2 - so_avg) / so_scale, (33520 - inhbt_avg) / inhbt_scale, (1456 - fnd_avg) / fnd_scale],
        [3, 'Drylts', (3 - so_avg) / so_scale, (3055 - inhbt_avg) / inhbt_scale, (1268 - fnd_avg) / fnd_scale],
        [4, 'Sleat', (4 - so_avg) / so_scale, (700 - inhbt_avg) / inhbt_scale, (1426 - fnd_avg) / fnd_scale],
        [5, 'Starum', (5 - so_avg) / so_scale, (960 - inhbt_avg) / inhbt_scale, (1061 - fnd_avg) / fnd_scale],
        [6, 'Hylpen', (6 - so_avg) / so_scale, (870 - inhbt_avg) / inhbt_scale, (1225 - fnd_avg) / fnd_scale],
        [7, 'Warkum', (7 - so_avg) / so_scale, (4440 - inhbt_avg) / inhbt_scale, (1399 - fnd_avg) / fnd_scale],
        [8, 'Boalsert', (8 - so_avg) / so_scale, (10120 - inhbt_avg) / inhbt_scale, (1455 - fnd_avg) / fnd_scale],
        [9, 'Harns', (9 - so_avg) / so_scale, (14740 - inhbt_avg) / inhbt_scale, (1234 - fnd_avg) / fnd_scale],
        [10, 'Frjentsjer', (10 - so_avg) / so_scale, (12760 - inhbt_avg) / inhbt_scale, (1374 - fnd_avg) / fnd_scale],
        [11, 'Dokkum', (11 - so_avg) / so_scale, (12675 - inhbt_avg) / inhbt_scale, (1298 - fnd_avg) / fnd_scale],
    ]
    assert_equals_data(
        result_w_mean_std,
        expected_columns=['_index_skating_order', 'city', 'skating_order', 'inhabitants', 'founding'],
        expected_data=expected_data_w_mean_std,
        round_decimals=True,
    )

    expected_w_std = StandardScaler(with_mean=False, with_std=True).fit_transform(pdf[numerical_cols])
    result_w_std = bt.scale(with_mean=False, with_std=True)

    np.testing.assert_almost_equal(expected_w_std, result_w_std[numerical_cols].to_numpy(), decimal=4)

    expected_data_w_std = [
        [1, 'Ljouwert', 1 / so_scale, 93485 / inhbt_scale, 1285 / fnd_scale],
        [2, 'Snits', 2 / so_scale, 33520 / inhbt_scale, 1456 / fnd_scale],
        [3, 'Drylts', 3 / so_scale, 3055 / inhbt_scale, 1268 / fnd_scale],
        [4, 'Sleat', 4 / so_scale, 700 / inhbt_scale, 1426 / fnd_scale],
        [5, 'Starum', 5 / so_scale, 960 / inhbt_scale, 1061 / fnd_scale],
        [6, 'Hylpen', 6 / so_scale, 870 / inhbt_scale, 1225 / fnd_scale],
        [7, 'Warkum', 7 / so_scale, 4440 / inhbt_scale, 1399 / fnd_scale],
        [8, 'Boalsert', 8 / so_scale, 10120 / inhbt_scale, 1455 / fnd_scale],
        [9, 'Harns', 9 / so_scale, 14740 / inhbt_scale, 1234 / fnd_scale],
        [10, 'Frjentsjer', 10 / so_scale, 12760 / inhbt_scale, 1374 / fnd_scale],
        [11, 'Dokkum', 11 / so_scale, 12675 / inhbt_scale, 1298 / fnd_scale],
    ]
    assert_equals_data(
        result_w_std,
        expected_columns=['_index_skating_order', 'city', 'skating_order', 'inhabitants', 'founding'],
        expected_data=expected_data_w_std,
        round_decimals=True,
    )

    expected_w_mean = StandardScaler(with_mean=True, with_std=False).fit_transform(pdf[numerical_cols])
    result_w_mean = bt.scale(with_mean=True, with_std=False)

    np.testing.assert_almost_equal(expected_w_mean, result_w_mean[numerical_cols].to_numpy(), decimal=4)

    expected_data_w_mean = [
        [1, 'Ljouwert', 1 - so_avg, 93485 - inhbt_avg, 1285 - fnd_avg],
        [2, 'Snits', 2 - so_avg, 33520 - inhbt_avg, 1456 - fnd_avg],
        [3, 'Drylts', 3 - so_avg, 3055 - inhbt_avg, 1268 - fnd_avg],
        [4, 'Sleat', 4 - so_avg, 700 - inhbt_avg, 1426 - fnd_avg],
        [5, 'Starum', 5 - so_avg, 960 - inhbt_avg, 1061 - fnd_avg],
        [6, 'Hylpen', 6 - so_avg, 870 - inhbt_avg, 1225 - fnd_avg],
        [7, 'Warkum', 7 - so_avg, 4440 - inhbt_avg, 1399 - fnd_avg],
        [8, 'Boalsert', 8 - so_avg, 10120 - inhbt_avg, 1455 - fnd_avg],
        [9, 'Harns', 9 - so_avg, 14740 - inhbt_avg, 1234 - fnd_avg],
        [10, 'Frjentsjer', 10 - so_avg, 12760 - inhbt_avg, 1374 - fnd_avg],
        [11, 'Dokkum', 11 - so_avg, 12675 - inhbt_avg, 1298 - fnd_avg],
    ]
    assert_equals_data(
        result_w_mean,
        expected_columns=['_index_skating_order', 'city', 'skating_order', 'inhabitants', 'founding'],
        expected_data=expected_data_w_mean,
        round_decimals=True,
    )
