"""
Copyright 2021 Objectiv B.V.
"""
import numpy as np
import pandas as pd
import pytest

from bach import DataFrame, SeriesString
from tests.functional.bach.test_data_and_utils import get_bt_with_test_data, assert_equals_data, df_to_list, \
    get_from_df


def test_series__getitem__():
    bt = get_bt_with_test_data(full_data_set=True)
    series = bt['city']
    assert isinstance(series, SeriesString)

    single_value_ref = series[1]
    assert isinstance(single_value_ref, SeriesString)
    value = single_value_ref.value
    assert isinstance(value, str)
    assert value == 'Ljouwert'

    single_value_ref = series[5]
    assert isinstance(single_value_ref, SeriesString)
    value = single_value_ref.value
    assert isinstance(value, str)
    assert value == 'Starum'

    l1 = bt.groupby('municipality').min()
    # selection on data of non-materialized groupby
    assert l1.inhabitants_min['Leeuwarden'].value == 93485

    non_existing_value_ref = l1.inhabitants_min['DoesNotExist']
    with pytest.raises(IndexError):
        non_existing_value_ref.value

    # selection on index of non-materialized groupby
    l2 = l1.groupby('_index_skating_order_min').city_min.nunique()
    assert l2[9].value == 1
    non_existing_value_ref = l2[5]
    with pytest.raises(IndexError):
        non_existing_value_ref.value


def test_series_value():
    bt = get_bt_with_test_data(full_data_set=False)
    assert bt.city[1] == 'Ljouwert'
    assert bt.count().city_count.value == 3

    # make sure getitem works when multiple nodes are in play.
    l1 = bt.groupby('municipality').count()
    l2 = l1.groupby().city_count.sum()
    assert l2.value == 3


def test_series_sort_values():
    bt = get_bt_with_test_data(full_data_set=True)
    bt_series = bt.city
    kwargs_list = [{'ascending': True},
                   {'ascending': False},
                   {}
                   ]
    for kwargs in kwargs_list:
        assert_equals_data(
            bt_series.sort_values(**kwargs),
            expected_columns=['_index_skating_order', 'city'],
            expected_data=df_to_list(bt.to_pandas()['city'].sort_values(**kwargs))
        )


def test_fillna():
    # TODO test fillna with series instead of constants.
    values = [1, np.nan, 3, np.nan, 7]
    pdf = pd.DataFrame(data=values)
    bt = get_from_df('test_fillna', pdf)

    def tf(x):
        bt_fill = bt['0'].fillna(x)
        assert bt_fill.expression.is_constant == bt['0'].expression.is_constant
        np.testing.assert_equal(pdf[0].fillna(x).values, bt_fill.values)

    assert(bt['0'].dtype == 'float64')
    tf(1.25)
    tf(float(99))
    tf(np.nan)

    # pandas allows this, but we can't
    for val in [int(99), 'nope']:
        with pytest.raises(TypeError):
            bt['0'].fillna(val)


def test_isnull():
    values = ['a', 'b', None]
    pdf = pd.DataFrame(data=values, columns=['text_with_null'])
    pdf.set_index('text_with_null', drop=False, inplace=True)
    bt = get_from_df('test_isnull', pdf)
    bt['const_not_null'] = 'not_null'
    bt['const_null'] = None
    bt['y'] = bt.text_with_null.isnull()
    bt['z'] = bt.text_with_null.notnull()
    assert bt.y.expression.is_constant == bt.text_with_null.expression.is_constant
    assert bt.z.expression.is_constant == bt.text_with_null.expression.is_constant
    assert bt.const_not_null.isnull().expression.is_constant
    assert bt.const_null.isnull().expression.is_constant
    assert bt.const_not_null.notnull().expression.is_constant
    assert bt.const_null.notnull().expression.is_constant
    assert_equals_data(
        bt,
        expected_columns=['_index_text_with_null', 'text_with_null', 'const_not_null', 'const_null', 'y', 'z'],
        expected_data=[['a', 'a', 'not_null', None, False, True],
                       ['b', 'b', 'not_null', None, False, True],
                       [None, None, 'not_null', None, True, False]]
    )


def test_aggregation():
    # Test aggregation on single series
    bt = get_bt_with_test_data(full_data_set=True)[['inhabitants']]
    s = bt['inhabitants']
    a1 = s.agg('sum')
    assert isinstance(a1, type(s))
    assert a1.expression.is_single_value
    assert a1.value == 187325

    a2 = s.sum()
    assert isinstance(a2, type(s))
    assert a1.expression.is_single_value
    assert a2.value == 187325

    df1 = s.agg(['sum', 'count'])
    assert isinstance(df1.inhabitants_sum, type(s))
    assert isinstance(df1.inhabitants_count, type(s))
    assert df1.inhabitants_sum.expression.is_single_value
    assert df1.inhabitants_count.expression.is_single_value

    # multiple series results return
    assert df1.inhabitants_sum.value == 187325
    assert df1.inhabitants_count.value == 11

    # duplicate result series should raise
    with pytest.raises(ValueError, match="duplicate"):
        s.agg(['sum','sum'])


def test_type_agnostic_aggregation_functions():
    bt = get_bt_with_test_data(full_data_set=True)
    btg = bt.groupby()

    # type agnostic aggregations
    aggregation_functions = ['count', 'max', 'min', 'nunique', 'mode', 'median']
    result_bt = btg[['municipality']].aggregate(aggregation_functions)

    result_series_dtypes = {
        'municipality_count': 'int64',
        'municipality_max': 'string',
        'municipality_min': 'string',
        'municipality_nunique': 'int64',
        'municipality_mode': 'string',
        'municipality_median': 'string'
    }

    assert_equals_data(
        result_bt,
        expected_columns=list(result_series_dtypes.keys()),
        expected_data=[
            [11, 'Waadhoeke', 'De Friese Meren', 6, 'Súdwest-Fryslân', 'Súdwest-Fryslân']
        ]
    )

    assert result_bt.dtypes == result_series_dtypes


def test_dataframe_agg_skipna_parameter():
    # test full parameter traversal
    bt = get_bt_with_test_data(full_data_set=True)[['inhabitants']]

    series_agg = ['count', 'max', 'median', 'min', 'mode', 'nunique']
    for agg in series_agg:
        with pytest.raises(NotImplementedError):
            # currently not supported anywhere, so needs to raise
            bt.agg(agg, skipna=False)


def test_to_frame():
    bt = get_bt_with_test_data(full_data_set=False)
    series = bt.inhabitants
    frame = series.to_frame()

    assert isinstance(frame, DataFrame)
    assert list(frame.index.keys()) == list(bt.inhabitants.index.keys())
    assert isinstance(series.to_pandas(), pd.Series)
    assert isinstance(frame.to_pandas(), pd.DataFrame)

    assert isinstance(frame, DataFrame)
    assert list(frame.index.keys()) == list(bt.inhabitants.index.keys())
    assert isinstance(series.head(), pd.Series)
    assert isinstance(frame.head(), pd.DataFrame)


def test_series_inherit_flag():
    # TODO: change this so it checks the flag correctly
    bts = get_bt_with_test_data(full_data_set=False).groupby('municipality')['founding']
    bts_min = bts.min()
    assert not bts.expression.has_aggregate_function
    assert bts_min.expression.has_aggregate_function

    bts_min_materialized = bts_min.to_frame().get_df_materialized_model()['founding']
    assert not bts_min_materialized.expression.has_aggregate_function

    assert_equals_data(
        bts_min_materialized,
        expected_columns=['municipality', 'founding'],
        expected_data=[
            ['Leeuwarden', 1285],
            ['Súdwest-Fryslân', 1268]
        ]
    )

    bts_min_min = bts_min_materialized.min()
    assert_equals_data(bts_min_min, expected_columns=['founding'], expected_data=[[1268]])

    # bts_min_min has applied an aggregate function to a materialized view, so the aggregation flag should
    # be True again
    assert bts_min_min.expression.has_aggregate_function

    # Check that aggregation flag correctly gets inherited if multiple series are involved in a comparison
    # aggregation flag on left hand series
    bts_derived = bts_min_min - 5
    assert bts_derived.expression.has_aggregate_function

    # aggregation flag on right hand series, but it gets resolved when creating a single value subquery to
    # actually make this query executable.
    bts_derived = bts_min_materialized - bts_min_min
    assert not bts_derived.expression.has_aggregate_function


def test_series_independant_subquery_any_all():
    bt = get_bt_with_test_data(full_data_set=True)
    s = bt.inhabitants.max() // 4

    bt[bt.inhabitants > s.any()].head()
    result_bt = bt[bt.inhabitants > s.all()]

    assert_equals_data(
        result_bt[['city', 'inhabitants']],
        expected_columns=['_index_skating_order', 'city', 'inhabitants'],
        expected_data=[
            [1, 'Ljouwert', 93485], [2, 'Snits', 33520]
        ]
    )


def test_series_independant_subquery_sets():
    bt = get_bt_with_test_data(full_data_set=True)
    # get 3 smallest cities
    s = bt.sort_values('inhabitants', True)[:3]
    result_bt = bt[bt.city.isin(s.city)]
    assert_equals_data(
        result_bt[['city', 'inhabitants']],
        expected_columns=['_index_skating_order', 'city', 'inhabitants'],
        expected_data=[
            [4, 'Sleat', 700], [5, 'Starum', 960], [6, 'Hylpen', 870]
        ]
    )

    result_bt = bt[~bt.city.isin(s.city)]
    assert_equals_data(
        result_bt[['city', 'inhabitants']],
        expected_columns=['_index_skating_order', 'city', 'inhabitants'],
        expected_data=[
            [1, 'Ljouwert', 93485], [2, 'Snits', 33520], [3, 'Drylts', 3055], [7, 'Warkum', 4440],
            [8, 'Boalsert', 10120], [9, 'Harns', 14740], [10, 'Frjentsjer', 12760], [11, 'Dokkum', 12675]
        ]
    )


def test_series_independant_subquery_single():
    bt = get_bt_with_test_data(full_data_set=True)
    # get smallest city
    s = bt.sort_values('inhabitants', True)[:1]
    result_bt = bt[bt.city == s.city]
    assert_equals_data(
        result_bt[['city', 'inhabitants']],
        expected_columns=['_index_skating_order', 'city', 'inhabitants'],
        expected_data=[
            [4, 'Sleat', 700]
        ]
    )
    # and some math
    bt = get_bt_with_test_data(full_data_set=False)
    result_bt = bt.inhabitants + s.inhabitants
    assert_equals_data(
        result_bt,
        expected_columns=['_index_skating_order', 'inhabitants'],
        expected_data=[
            [1, 94185], [2, 34220], [3, 3755]
        ]
    )


def test_series_different_aggregations():
    bt = get_bt_with_test_data(full_data_set=True)
    v = bt.groupby('municipality').skating_order.nunique() / bt.skating_order.nunique()
    assert_equals_data(
        v,
        expected_columns=['municipality', 'skating_order'],
        expected_data=[['De Friese Meren', 0.09090909090909091], ['Harlingen', 0.09090909090909091],
                       ['Leeuwarden', 0.09090909090909091], ['Noardeast-Fryslân', 0.09090909090909091],
                       ['Súdwest-Fryslân', 0.5454545454545454], ['Waadhoeke', 0.09090909090909091]]
    )

    with pytest.raises(Exception, match='different base_node or group_by, but contains more than one value.'):
        bt.skating_order.nunique() / bt.groupby('municipality').skating_order.nunique()
