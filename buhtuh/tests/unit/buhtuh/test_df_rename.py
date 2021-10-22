"""
Copyright 2021 Objectiv B.V.
"""
import pytest

from tests.unit.buhtuh.util import get_fake_df_test_data


def test_rename():
    bt = get_fake_df_test_data()

    nbt = bt.rename(columns={'founding': 'fnd'})
    assert 'founding' not in nbt.data.keys()
    assert 'fnd' in nbt.data.keys()
    assert 'founding' in bt.data.keys()
    assert 'fnd' not in bt.data.keys()
    assert bt.founding.expression == nbt.fnd.expression

    # rename to self
    bt = get_fake_df_test_data()
    nbt = bt.rename(columns={'city': 'city'})
    assert 'city' in nbt.data.keys()
    assert 'city' in bt.data.keys()

    # swap
    bt = get_fake_df_test_data()
    expr_inhabitants = bt.inhabitants.expression
    expr_city = bt.city.expression
    nbt = bt.rename(columns={'city': 'inhabitants', 'inhabitants': 'city'})
    assert 'city' in nbt.data.keys()
    assert 'inhabitants' in nbt.data.keys()
    assert nbt.city.expression == expr_inhabitants
    assert nbt.inhabitants.expression == expr_city

    expr = bt.founding.expression
    nbt = bt.rename(columns={'founding': 'fnd'}, inplace=True)
    assert 'founding' not in nbt.data.keys()
    assert 'fnd' in nbt.data.keys()
    assert 'founding' not in bt.data.keys()
    assert 'fnd' in bt.data.keys()
    assert bt.fnd.expression == expr

    # multiple
    bt = get_fake_df_test_data()
    nbt = bt.rename(columns={'founding': 'fnd', 'city': 'cty'})
    assert 'founding' not in nbt.data.keys()
    assert 'fnd' in nbt.data.keys()
    assert 'founding' in bt.data.keys()
    assert 'fnd' not in bt.data.keys()
    assert 'city' not in nbt.data.keys()
    assert 'cty' in nbt.data.keys()
    assert 'city' in bt.data.keys()
    assert 'cty' not in bt.data.keys()

    # through mapper dict
    bt = get_fake_df_test_data()
    nbt = bt.rename(mapper={'city': 'cty'}, axis=1)
    assert 'city' not in nbt.data.keys()
    assert 'cty' in nbt.data.keys()
    assert 'city' in bt.data.keys()
    assert 'cty' not in bt.data.keys()

    # through mapper lambda
    bt = get_fake_df_test_data()
    nbt = bt.rename(mapper=lambda x: x[::-1], axis=1)
    assert 'city' not in nbt.data.keys()
    assert 'ytic' in nbt.data.keys()
    assert 'city' in bt.data.keys()
    assert 'ytic' not in bt.data.keys()

    # mapper func no rename
    expr = bt.city.expression
    bt = get_fake_df_test_data()
    nbt = bt.rename(mapper=lambda x: x, axis=1)
    assert 'city' in nbt.data.keys()
    assert 'city' in bt.data.keys()
    assert bt.city.expression == expr

    bt.rename(columns={'non existing column': 'new name'}, errors='ignore')

    with pytest.raises(KeyError):
        bt.rename(columns={'non existing column': 'new name'}, errors='raise')
