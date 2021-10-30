"""
Copyright 2021 Objectiv B.V.
"""
import pytest

from tests.functional.buhtuh.test_data_and_utils import get_bt_with_test_data, assert_equals_data


def test_reset_index_to_empty():
    bt = get_bt_with_test_data()
    assert list(bt.index.keys()) == ['_index_skating_order']
    assert '_index_skating_order' not in bt.data.keys()

    # regular
    rbt = bt.reset_index()
    assert list(rbt.index.keys()) == []
    assert '_index_skating_order' in rbt.data.keys()

    # inplace
    ipbt = get_bt_with_test_data()
    ipbt.reset_index(inplace=True)
    assert list(ipbt.index.keys()) == []
    assert '_index_skating_order' in ipbt.data.keys()

    # drop
    dbt = bt.reset_index(drop=True)
    assert list(rbt.index.keys()) == []
    assert '_index_skating_order' not in bt.data.keys()

    for r in [bt, rbt, ipbt, dbt]:
        for s in r.index.values():
            assert(s.index == {})
        for s in r.data.values():
            assert(s.index == r.index)
        r.head()


def test_set_index():
    bt = get_bt_with_test_data()[['municipality', 'city', 'inhabitants']]
    assert list(bt.index.keys()) == ['_index_skating_order']

    # regular reset in different ways
    sbt = bt.set_index(keys=[])
    rbt = bt.reset_index()
    assert list(rbt.index.keys()) == []
    assert list(sbt.index.keys()) == []
    assert '_index_skating_order' in sbt.data
    sbt.head()  # check valid sql /df conversion
    rbt.head()

    # we won't test inplace here, as that's done in test_reset_index_to_empty().

    # regular set
    with pytest.raises(ValueError,
                       match="When adding index series, drop must be True because duplicate"):
        bt.set_index(keys=['municipality'])

    sbt = bt.set_index(['municipality'], drop=True)
    assert list(sbt.index.keys()) == ['municipality']
    assert list(sbt.data.keys()) == ['city', 'inhabitants']
    sbt.head()  # check valid sql

    # set to existing raises keyerror, because the columns
    nbt = sbt.set_index(['municipality'], drop=True)
    assert list(nbt.index.keys()) == ['municipality']
    assert list(nbt.data.keys()) == ['city', 'inhabitants']
    nbt.head()  # check valid sql

    # set to existing changes nothing and does not raise
    with pytest.raises(ValueError,
                       match="When adding index series, drop must be True because duplicate"):
        sbt.set_index(['city'], append=True)

    abt = sbt.set_index(['city'], append=True, drop=True)
    assert list(abt.index.keys()) == ['municipality', 'city']
    assert list(abt.data.keys()) == ['inhabitants']
    abt.head()  # check valid sql

    # try to remove a series
    rbt = abt.set_index(['city'])
    assert list(rbt.index.keys()) == ['city']
    assert list(rbt.data.keys()) == ['municipality', 'inhabitants']
    rbt.head()

    # try to remove a series with drop
    rbt = abt.set_index(['city'], drop=True)
    assert list(rbt.index.keys()) == ['city']
    assert list(rbt.data.keys()) == ['inhabitants']
    rbt.head()

    # try to remove a series from the other end
    rbt = abt.set_index(['municipality'])
    assert list(rbt.index.keys()) == ['municipality']
    assert list(rbt.data.keys()) == ['city', 'inhabitants']
    rbt.head()

    # try to remove a series from the other end with drop
    rbt = abt.set_index(['municipality'], drop=True)
    assert list(rbt.index.keys()) == ['municipality']
    assert list(rbt.data.keys()) == ['inhabitants']
    rbt.head()

    # try to set a series as index
    sbt = bt.set_index(bt.municipality, drop=True)
    assert list(sbt.index.keys()) == ['municipality']
    assert list(sbt.data.keys()) == ['city', 'inhabitants']
    sbt.head()

    # try to set a series as index
    sbt = bt.set_index(bt.municipality.slice(3), drop=True)
    assert list(sbt.index.keys()) == ['municipality']
    assert list(sbt.data.keys()) == ['city', 'inhabitants']
    sbt.head()


def test_reset_index_materialize():
    bt = get_bt_with_test_data()[['municipality', 'inhabitants']]
    assert list(bt.index.keys()) == ['_index_skating_order']

    bt = bt.groupby('municipality').sum()
    assert list(bt.index.keys()) == ['municipality']
    bt.head()  # check valid sql

    # regular
    with pytest.raises(NotImplementedError,
                       match="reset_index not supported on non-materialized groupbys"):
        bt.reset_index()
    rbt = bt.reset_index(materialize=True)
    assert list(bt.index.keys()) == ['municipality']
    rbt.head()  # check valid sql

    # inplace not supported when materialization is needed, as we can not make those changes
    # to a dataframe yet.
    with pytest.raises(NotImplementedError,
                       match="reset_index not supported on non-materialized groupbys"):
        bt.reset_index(inplace=True)
    with pytest.raises(NotImplementedError,
                       match="inplace materialization is not supported"):
        bt.reset_index(materialize=True, inplace=True)

    for r in [bt, rbt]:
        for s in r.index.values():
            assert(s.index == {})
        for s in r.data.values():
            assert(s.index == r.index)

        assert_equals_data(r,
                           expected_columns=['municipality', '_index_skating_order_sum',
                                             'inhabitants_sum'],
                           expected_data=[
                               ['Leeuwarden', 1, 93485],
                               ['Súdwest-Fryslân', 5, 36575]
                           ])