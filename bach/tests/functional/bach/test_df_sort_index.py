import pytest

from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data, \
    get_bt_with_railway_data


def test_sort_index_basic():
    bt = get_bt_with_test_data()[['founding', 'city']]
    bt = bt.set_index(['founding'], drop=True)

    result = bt.sort_index()
    assert_equals_data(
        result,
        expected_columns=['founding', 'city'],
        expected_data=[
            [1268, 'Drylts'],
            [1285, 'Ljouwert'],
            [1456, 'Snits'],
        ],
    )


def test_sort_index_w_level():
    btr = get_bt_with_railway_data()
    btr = btr.set_index(['town', 'platforms'], drop=True)

    with pytest.raises(ValueError, match=r'dataframe has only 2 levels'):
        btr.sort_index(level=3)

    with pytest.raises(ValueError, match=r'dataframe has no random index level'):
        btr.sort_index(level='random')

    with pytest.raises(ValueError, match=r'dataframe has no random index level'):
        btr.sort_index(level=[0, 'random'])

    result = btr.sort_index(level=['platforms', 0, 'platforms'])
    assert_equals_data(
        result,
        expected_columns=['town', 'platforms', 'station_id', 'station'],
        expected_data=[
            ['Drylts', 1, 1, 'IJlst'],
            ['It Hearrenfean', 1, 2, 'Heerenveen'],
            ['Ljouwert', 1, 5, 'Camminghaburen'],
            ['It Hearrenfean', 2, 3, 'Heerenveen IJsstadion'],
            ['Snits', 2, 7, 'Sneek Noord'],
            ['Snits', 2, 6, 'Sneek'],
            ['Ljouwert', 4, 4, 'Leeuwarden'],
        ],
    )


def test_index_sort_w_ascending():
    bt = get_bt_with_test_data()[['founding', 'city']]
    bt = bt.set_index(['founding'], drop=True)

    with pytest.raises(ValueError, match=r'Length of ascending'):
        bt.sort_index(ascending=[True, False])

    result = bt.sort_index(ascending=False)
    assert_equals_data(
        result,
        expected_columns=['founding', 'city'],
        expected_data=[
            [1456, 'Snits'],
            [1285, 'Ljouwert'],
            [1268, 'Drylts'],
        ],
    )


def test_index_sort_w_inplace():
    bt = get_bt_with_test_data()[['founding', 'city']]
    bt = bt.set_index(['founding'], drop=True)

    result = bt.sort_index(inplace=True, ascending=False)
    assert result is None

    assert_equals_data(
        bt,
        expected_columns=['founding', 'city'],
        expected_data=[
            [1456, 'Snits'],
            [1285, 'Ljouwert'],
            [1268, 'Drylts'],
        ],
    )
