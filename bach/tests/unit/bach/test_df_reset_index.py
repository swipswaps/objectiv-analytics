"""
Copyright 2022 Objectiv B.V.
"""
from tests.unit.bach.util import get_fake_df_test_data


def test_reset_index_no_change(dialect):
    bt = get_fake_df_test_data(dialect)
    bt = bt.set_index(['skating_order', 'city'], append=True)
    lbt = bt.reset_index(level=[])
    assert list(lbt.index.keys()) == list(bt.index.keys())
