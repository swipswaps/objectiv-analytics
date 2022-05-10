"""
Copyright 2022 Objectiv B.V.
"""
import pytest

from bach import SeriesDict
from sql_models.util import DatabaseNotSupportedException, is_bigquery, is_postgres
from tests.unit.bach.util import get_fake_df_test_data


def test_db_not_supported_error_on_not_supported_db(dialect):
    df = get_fake_df_test_data(dialect=dialect)
    struct = {'a': 123, 'b': 'test'}
    dtype = {'a': 'int64', 'b': 'string'}

    # Creating a SeriesDict, should work on BigQuery, should give a clear error on Postgres.
    # wrap call in function, so it's super clear we test the same statement for all dialects
    def call_to_test():
        return SeriesDict.from_value(base=df, value=struct, name='struct', dtype=dtype)

    if is_bigquery(dialect):
        df['struct'] = call_to_test()
    if is_postgres(dialect):
        match = 'SeriesDict is not supported for postgresql, try SeriesJson'
        with pytest.raises(DatabaseNotSupportedException, match=match):
            df['struct'] = call_to_test()
