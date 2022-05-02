"""
Copyright 2022 Objectiv B.V.
"""
import pytest

from bach.series.series_array import SeriesArray
from sql_models.util import is_bigquery, is_postgres


def test_supported_value_to_literal(dialect):

    result_empty = SeriesArray.supported_value_to_literal(dialect, [], ['string'])
    result_int = SeriesArray.supported_value_to_literal(dialect, [1, 2, 3], ['int64'])
    result_str = SeriesArray.supported_value_to_literal(dialect, ['abc', 'def'], ['string'])
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
        SeriesArray.supported_value_to_literal(dialect, [1, '2'], ['int64'])
