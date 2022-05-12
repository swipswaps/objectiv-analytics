"""
Copyright 2021 Objectiv B.V.
"""
import pytest

from bach.series import Series
from tests.functional.bach.test_data_and_utils import get_df_with_test_data


def test_reset_index_to_empty(engine):
    bt = get_df_with_test_data(engine)
    sbt = bt['city']
    assert isinstance(sbt, Series)
    assert list(sbt.index.keys()) == ['_index_skating_order']

    # regular
    rbt = sbt.reset_index()
    assert list(rbt.index.keys()) == []
    assert '_index_skating_order' in rbt.data

    # drop
    dbt = sbt.reset_index(drop=True)
    assert list(dbt.index.keys()) == []
    assert '_index_skating_order' not in dbt.data

    for r in [bt, rbt, dbt]:
        for s in r.index.values():
            assert(s.index == {})
        for s in r.data.values():
            assert(s.index == r.index)
        r.head()

    bt_cp = bt.copy()
    bt_cp = bt_cp.set_index(['skating_order', 'city'], append=True)
    bt_cp = bt_cp["municipality"]
    final_index = ['_index_skating_order', 'skating_order']

    # level
    lbt = bt_cp.reset_index(level='city')
    assert 'city' in lbt.data
    assert list(lbt.index.keys()) == final_index

    # level + drop
    lbt = bt_cp.reset_index(level='city', drop=True)
    assert 'city' not in lbt.data
    assert list(lbt.index.keys()) == final_index

    # dropping invalid level
    invalid_level = 'random'
    with pytest.raises(ValueError, match=fr"'{invalid_level}' level not found"):
        bt_cp.reset_index(level=['city', invalid_level])
