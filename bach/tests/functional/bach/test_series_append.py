from bach import Series
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data


def test_series_append_same_dtype() -> None:
    bt = get_bt_with_test_data(full_data_set=False)[['city', 'skating_order']]
    bt.skating_order = bt.skating_order.astype(str)

    result = bt.city.append(bt.skating_order)
    assert isinstance(result, Series)

    assert_equals_data(
        result.sort_values(),
        expected_columns=['_index_skating_order', 'city_skating_order'],
        expected_data=[
            [1, '1'],
            [2, '2'],
            [3, '3'],
            [3, 'Drylts'],
            [1, 'Ljouwert'],
            [2, 'Snits'],
        ],
    )


def test_series_append_different_dtype() -> None:
    bt = get_bt_with_test_data(full_data_set=False)[['city', 'inhabitants', 'founding']]
    bt['founding'] = bt['founding'].astype('float64')

    result = bt.city.append(bt.founding)
    assert isinstance(result, Series)

    assert_equals_data(
        result.sort_values(),
        expected_columns=['_index_skating_order', 'city_founding'],
        expected_data=[
            [3, '1268'],
            [1, '1285'],
            [2, '1456'],
            [3, 'Drylts'],
            [1, 'Ljouwert'],
            [2, 'Snits'],
        ]
    )

    result2 = bt.inhabitants.append(bt.founding)
    assert isinstance(result2, Series)

    assert_equals_data(
        result2.sort_values(ascending=False),
        expected_columns=['_index_skating_order', 'inhabitants_founding'],
        expected_data=[
            [1, 93485.],
            [2, 33520.],
            [3, 3055.],
            [2, 1456.],
            [1, 1285.],
            [3, 1268.],
        ],
    )

    result3 = bt.city.append([bt.founding, bt.inhabitants])
    assert_equals_data(
        result3.sort_values(),
        expected_columns=['_index_skating_order', 'city_founding_inhabitants'],
        expected_data=[
            [3, '1268'],
            [1, '1285'],
            [2, '1456'],
            [3, '3055'],
            [2, '33520'],
            [1, '93485'],
            [3, 'Drylts'],
            [1, 'Ljouwert'],
            [2, 'Snits'],
        ]
    )


def test_series_ignore_index() -> None:
    bt = get_bt_with_test_data(full_data_set=False)[['city', 'skating_order']]
    bt.skating_order = bt.skating_order.astype(str)

    result = bt.city.append(bt.skating_order, ignore_index=True)
    assert isinstance(result, Series)

    assert_equals_data(
        result.sort_values(),
        expected_columns=['city_skating_order'],
        expected_data=[
            ['1'],
            ['2'],
            ['3'],
            ['Drylts'],
            ['Ljouwert'],
            ['Snits'],
        ],
    )
