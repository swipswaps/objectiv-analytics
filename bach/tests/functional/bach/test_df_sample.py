"""
Copyright 2021 Objectiv B.V.
"""
import pytest

from sql_models.graph_operations import get_graph_nodes_info
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data


def test_get_sample():
    bt = get_bt_with_test_data(True)
    bt_sample = bt.get_sample(table_name='test_data_sample',
                              sample_percentage=50,
                              seed=200,
                              overwrite=True)

    assert_equals_data(
        bt_sample,
        expected_columns=[
            '_index_skating_order',  # index
            'skating_order', 'city', 'municipality', 'inhabitants', 'founding',  # data columns
        ],
        expected_data=[
            [3, 3, 'Drylts', 'Súdwest-Fryslân', 3055, 1268],
            [4, 4, 'Sleat', 'De Friese Meren', 700, 1426],
            [6, 6, 'Hylpen', 'Súdwest-Fryslân', 870, 1225]
        ]
    )


def test_sample_operations():
    bt = get_bt_with_test_data(True)
    bt_sample = bt.get_sample(table_name='test_data_sample',
                              sample_percentage=50,
                              seed=200,
                              overwrite=True)

    bt_sample['better_city'] = bt_sample.city + '_but_better'
    bt_sample['a'] = bt_sample.city + bt_sample.municipality
    bt_sample['big_city'] = bt_sample.inhabitants + 10
    bt_sample['b'] = bt_sample.inhabitants + bt_sample.founding

    assert bt_sample.skating_order.nunique()[1] == 3

    all_data_bt = bt_sample.get_unsampled()

    assert_equals_data(
        all_data_bt,
        expected_columns=[
            '_index_skating_order',  # index
            'skating_order', 'city', 'municipality', 'inhabitants', 'founding',
            'better_city', 'a', 'big_city', 'b'
        ],
        expected_data=[
            [1, 1, 'Ljouwert', 'Leeuwarden', 93485, 1285, 'Ljouwert_but_better',
             'LjouwertLeeuwarden', 93495, 94770],
            [2, 2, 'Snits', 'Súdwest-Fryslân', 33520, 1456, 'Snits_but_better',
             'SnitsSúdwest-Fryslân', 33530, 34976],
            [3, 3, 'Drylts', 'Súdwest-Fryslân', 3055, 1268, 'Drylts_but_better',
             'DryltsSúdwest-Fryslân', 3065, 4323],
            [4, 4, 'Sleat', 'De Friese Meren', 700, 1426, 'Sleat_but_better',
             'SleatDe Friese Meren', 710, 2126],
            [5, 5, 'Starum', 'Súdwest-Fryslân', 960, 1061, 'Starum_but_better',
             'StarumSúdwest-Fryslân', 970, 2021],
            [6, 6, 'Hylpen', 'Súdwest-Fryslân', 870, 1225, 'Hylpen_but_better',
             'HylpenSúdwest-Fryslân', 880, 2095],
            [7, 7, 'Warkum', 'Súdwest-Fryslân', 4440, 1399, 'Warkum_but_better',
             'WarkumSúdwest-Fryslân', 4450, 5839],
            [8, 8, 'Boalsert', 'Súdwest-Fryslân', 10120, 1455, 'Boalsert_but_better',
             'BoalsertSúdwest-Fryslân', 10130, 11575],
            [9, 9, 'Harns', 'Harlingen', 14740, 1234, 'Harns_but_better',
             'HarnsHarlingen', 14750, 15974],
            [10, 10, 'Frjentsjer', 'Waadhoeke', 12760, 1374, 'Frjentsjer_but_better',
             'FrjentsjerWaadhoeke', 12770, 14134],
            [11, 11, 'Dokkum', 'Noardeast-Fryslân', 12675, 1298, 'Dokkum_but_better',
             'DokkumNoardeast-Fryslân', 12685, 13973]
        ]
    )


def test_get_unsampled_multiple_nodes():
    # 1. Start with dataframe with multiple nodes in graph
    # 2. Create sampled dataframe
    # 3. Add node to sampled dataframe
    # 4. Go back to unsampled data
    bt = get_bt_with_test_data(False)
    bt = bt[['municipality', 'inhabitants', 'founding']]
    bt['inhabitants_more'] = bt['inhabitants'] + 1000
    bt = bt.materialize()
    bt['inhabitants_more'] = bt['inhabitants_more'] + 1000

    node_count_bt = len(get_graph_nodes_info(bt.base_node))
    assert node_count_bt == 2

    bt_sample = bt.get_sample(table_name='test_data_sample',
                              sample_percentage=50,
                              seed=200,
                              overwrite=True)
    bt_sample = bt_sample[['municipality', 'inhabitants_more', 'founding']]
    bt_sample['inhabitants_plus_3000'] = bt_sample['inhabitants_more'] + 1000
    del bt_sample['inhabitants_more']
    bt_sample = bt_sample.materialize()
    bt_sample = bt_sample.groupby('municipality').sum(numeric_only=True)
    bt_sample['inhabitants_plus_3000_sum'] -= 3000

    node_count_bt_sample = len(get_graph_nodes_info(bt_sample.base_node))
    assert node_count_bt_sample == 2

    bt2 = bt_sample.get_unsampled()

    node_count_bt2 = len(get_graph_nodes_info(bt2.base_node))
    assert node_count_bt2 == node_count_bt + node_count_bt_sample == 4

    with pytest.raises(ValueError, match='has not been sampled'):
        bt2.get_unsampled()

    assert_equals_data(
        bt2,
        expected_columns=[
            'municipality', '_index_skating_order_sum', 'founding_sum', 'inhabitants_plus_3000_sum'
        ],
        expected_data=[
            ['Leeuwarden', 1, 1285, 93485],
            ['Súdwest-Fryslân', 5, 2724, 39575]
        ]
    )
