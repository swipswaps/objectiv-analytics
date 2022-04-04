"""
Copyright 2021 Objectiv B.V.
"""
from bach import Series, SeriesString
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data, \
    get_df_with_test_data


def test_from_const(pg_engine):
    # TODO: BigQuery
    a = 'a string'
    b = 'a string\'"\'\' "" \\ with quotes'
    c = None
    d = '\'\'!@&*(HJD☢%'

    bt = get_df_with_test_data(pg_engine)[['city']]
    bt['a'] = a
    bt['b'] = b
    bt['c'] = SeriesString.from_const(base=bt, value=c, name='temp')
    bt['d'] = SeriesString.from_const(base=bt, value=d, name='temp')
    assert_equals_data(
        bt,
        expected_columns=['_index_skating_order', 'city', 'a', 'b', 'c', 'd'],
        expected_data=[
            [1, 'Ljouwert', a, b, c, d],
            [2, 'Snits', a, b, c, d],
            [3, 'Drylts', a, b, c, d]
        ]
    )


def test_string_slice(engine):
    bt = get_df_with_test_data(engine)
    # TODO: this test passes on BigQuery, but is very slow

    # Now try some slices
    for s in [
        # single values, keep small because we don't want to go out of range
        0, 1, 3, -3, -1,
        # some single value slices
        slice(0), slice(1), slice(5), slice(-5), slice(-1),
        # simple slices
        slice(0, 3), slice(1, 3), slice(3, 3), slice(4, 3),
        # Some negatives
        slice(-4, -2), slice(-2, -2), slice(-2, 1), slice(1, -2),
        # some longer than some of the input strings
        slice(1, -8), slice(8, 1), slice(8, -4),
        # Some more with no beginnings or endings
        slice(None, 3), slice(3, None), slice(None, -3), slice(-3, None)
    ]:
        print(f'slice: {s}')
        if (isinstance(s, slice)):
            bts1 = bt['city'].str[s.start:s.stop]
            bts2 = bt['city'].str.slice(s.start, s.stop)
        else:
            bts1 = bt['city'].str[s]
            bts2 = bt['city'].str.slice(s, s+1)
        for bts in [bts1, bts2]:
            assert isinstance(bts, Series)
            assert_equals_data(
                bts,
                expected_columns=['_index_skating_order', 'city'],
                expected_data=[
                    [1, 'Ljouwert'.__getitem__(s)],
                    [2, 'Snits'.__getitem__(s)],
                    [3, 'Drylts'.__getitem__(s)]
                ]
            )


def test_add_string_series(engine):
    bt = get_df_with_test_data(engine)
    bts = bt['city'] + ' is in the municipality ' + bt['municipality']
    assert isinstance(bts, Series)
    assert_equals_data(
        bts,
        expected_columns=['_index_skating_order', 'city'],
        expected_data=[
            [1, 'Ljouwert is in the municipality Leeuwarden'],
            [2, 'Snits is in the municipality Súdwest-Fryslân'],
            [3, 'Drylts is in the municipality Súdwest-Fryslân']
        ]
    )
