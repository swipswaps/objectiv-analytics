from bach import SeriesBoolean
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data


def test_from_const():
    bt = get_bt_with_test_data()[['city']]
    bt['t'] = True
    bt['f'] = False
    assert_equals_data(
        bt[:1],
        expected_columns=['_index_skating_order', 'city', 't', 'f'],
        expected_data=[
            [1, 'Ljouwert', True, False],
        ]
    )
    
def test_operations():
    bt = get_bt_with_test_data()[['city']]
    expected = []
    bt['t'] = True
    bt['f'] = False

    expected.extend([True, False])

    bt['and1'] = bt.t & bt.f
    bt['and2'] = bt.f & bt.t
    bt['and3'] = bt.t & bt.t
    bt['and4'] = bt.f & bt.f
    expected.extend([False, False, True, False])

    bt['or1'] = bt.t | bt.f
    bt['or2'] = bt.f | bt.t
    bt['or3'] = bt.t | bt.t
    bt['or4'] = bt.f | bt.f
    expected.extend([True, True, True, False])
    
    bt['xor1'] = bt.t ^ bt.f
    bt['xor2'] = bt.f ^ bt.t
    bt['xor3'] = bt.t ^ bt.t
    bt['xor4'] = bt.f ^ bt.f
    expected.extend([True, True, False, False])

    bt['inv1'] = ~bt.t
    bt['inv2'] = ~bt.f
    expected.extend([False, True])

    # this currently does not work as we cast to bigint, and that can not be casted back to bool
    # bt['int'] = 12
    # bt['int_astype'] = bt.int.astype('bool')
    # bt['int_and'] = bt.f & bt.int
    # bt['int_or'] = bt.f | bt.int
    # bt['int_xor'] = bt.f ^ bt.int
    # expected.extend([12, True, False, True, True])

    assert_equals_data(
        bt[:1],
        expected_columns=list(bt.all_series.keys()),
        expected_data=[
            [1, 'Ljouwert', *expected],
        ]
    )

