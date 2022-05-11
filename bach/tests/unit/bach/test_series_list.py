"""
Copyright 2022 Objectiv B.V.
"""
import pytest

from bach.series import SeriesList
from sql_models.util import is_bigquery, is_postgres, DatabaseNotSupportedException
from tests.unit.bach.util import get_fake_df_test_data


@pytest.mark.skip_postgres
def test_supported_value_to_literal(dialect):

    result_empty = SeriesList.supported_value_to_literal(dialect, [], ['string'])
    result_int = SeriesList.supported_value_to_literal(dialect, [1, 2, 3], ['int64'])
    result_str = SeriesList.supported_value_to_literal(dialect, ['abc', 'def'], ['string'])
    if is_postgres(dialect):
        assert result_empty.to_sql(dialect) == 'ARRAY[]::text[]'
        assert result_int.to_sql(dialect) == 'ARRAY[cast(1 as bigint), cast(2 as bigint), cast(3 as bigint)]'
        assert result_str.to_sql(dialect) == "ARRAY['abc', 'def']"
    elif is_bigquery(dialect):
        assert result_empty.to_sql(dialect) == 'ARRAY<STRING>[]'
        assert result_int.to_sql(dialect) == '[1, 2, 3]'
        assert result_str.to_sql(dialect) == '["""abc""", """def"""]'
    else:
        raise Exception()

    with pytest.raises(ValueError, match='Dtype does not match value'):
        SeriesList.supported_value_to_literal(dialect, [1, '2'], ['int64'])


def test_db_not_supported_error_on_not_supported_db(dialect):
    df = get_fake_df_test_data(dialect=dialect)
    arr = [123, 456, 789]
    dtype = ['int64']

    # Creating a SeriesDict, should work on BigQuery, should give a clear error on Postgres.
    # wrap call in function, so it's super clear we test the same statement for all dialects
    def call_to_test():
        return SeriesList.from_value(base=df, value=arr, name='struct', dtype=dtype)

    if is_bigquery(dialect):
        df['struct'] = call_to_test()
    if is_postgres(dialect):
        match = 'SeriesList is not supported for postgresql, try SeriesJson'
        with pytest.raises(DatabaseNotSupportedException, match=match):
            df['struct'] = call_to_test()
