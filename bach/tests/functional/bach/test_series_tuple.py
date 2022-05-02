"""
Copyright 2022 Objectiv B.V.
"""
from bach.series.series_tuple import SeriesTuple
from tests.functional.bach.test_data_and_utils import get_df_with_test_data, assert_equals_data


def test_basic_value_to_expression(engine):
    df = get_df_with_test_data(engine)[['skating_order']]
    df = df.sort_index()[:1].materialize()
    df['tuple1'] = SeriesTuple.from_value(
        base=df,
        value=(1, 2),
        name='tuple1',
        dtype=('int64', 'int64')
    )
    df['tuple2'] = SeriesTuple.from_value(
        base=df,
        value=('a', 0.1, 100),
        name='tuple2',
        dtype=('string', 'float64', 'int64')
    )
    df = df.materialize()
    print(df.dtypes)
    assert_equals_data(
        df,
        use_to_pandas=True,
        expected_columns=['_index_skating_order', 'skating_order', 'tuple1', 'tuple2'],
        expected_data=[[1, 1, (1, 2), ('a', 0.1, 100)]]
    )
