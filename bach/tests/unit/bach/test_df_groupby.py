"""
Copyright 2022 Objectiv B.V.
"""
import pytest
from tests.unit.bach.util import get_fake_df_test_data


def test_unmaterializable_groupby_boolean_functions(dialect):
    # Windowing function are not allowed as boolean row selectors.
    bt = get_fake_df_test_data(dialect)
    btg_min_fnd = bt.groupby('municipality')['founding'].min()

    assert btg_min_fnd.base_node == bt.base_node
    assert btg_min_fnd.group_by != bt.group_by
    assert not btg_min_fnd.expression.is_single_value

    with pytest.raises(ValueError, match=r'dtypes of indexes to be merged should be the same'):
        # todo pandas: Can only compare identically-labeled Series objects
        bt[btg_min_fnd == bt.founding]

    with pytest.raises(ValueError, match=r'dtypes of indexes to be merged should be the same'):
        # todo pandas: Can only compare identically-labeled Series objects
        bt[bt.founding == btg_min_fnd]
