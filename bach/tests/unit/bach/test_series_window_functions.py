from sql_models.util import is_bigquery
from tests.unit.bach.util import get_fake_df


def test_window_row_number(dialect):
    left = get_fake_df(dialect, ['a'], ['b', 'c'])
    series_b = left['b']
    result = series_b.sort_values(ascending=True).window_row_number()

    result_sql = result.expression.to_sql(dialect)
    if is_bigquery(dialect):
        assert result_sql == 'row_number() over ( order by `b` asc )'

    else:
        assert result_sql == (
            'row_number() over ( order by "b" asc RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'
        )


def test_window_rank(dialect):
    left = get_fake_df(dialect, ['a'], ['b', 'c'])
    series_b = left['b']
    result = series_b.sort_values(ascending=True).window_rank()

    result_sql = result.expression.to_sql(dialect)
    if is_bigquery(dialect):
        assert result_sql == 'rank() over ( order by `b` asc )'

    else:
        assert result_sql == (
            'rank() over ( order by "b" asc RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'
        )


def test_window_dense_rank(dialect):
    left = get_fake_df(dialect, ['a'], ['b', 'c'])
    series_b = left['b']
    result = series_b.sort_values(ascending=True).window_dense_rank()

    result_sql = result.expression.to_sql(dialect)
    if is_bigquery(dialect):
        assert result_sql == 'dense_rank() over ( order by `b` asc )'

    else:
        assert result_sql == (
            'dense_rank() over ( order by "b" asc RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'
        )


def test_window_percent_rank(dialect):
    left = get_fake_df(dialect, ['a'], ['b', 'c'])
    series_b = left['b']
    result = series_b.sort_values(ascending=True).window_percent_rank()

    result_sql = result.expression.to_sql(dialect)
    if is_bigquery(dialect):
        assert result_sql == 'percent_rank() over ( order by `b` asc )'

    else:
        assert result_sql == (
            'percent_rank() over ( order by "b" asc RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'
        )


def test_window_cume_dist(dialect):
    left = get_fake_df(dialect, ['a'], ['b', 'c'])
    series_b = left['b']
    result = series_b.sort_values(ascending=False).window_cume_dist()

    result_sql = result.expression.to_sql(dialect)
    if is_bigquery(dialect):
        assert result_sql == 'cume_dist() over ( order by `b` desc )'

    else:
        assert result_sql == (
            'cume_dist() over ( order by "b" desc RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'
        )


def test_window_ntile(dialect):
    left = get_fake_df(dialect, ['a'], ['b', 'c'])
    series_b = left['b']
    result = series_b.sort_values(ascending=False).window_ntile()

    result_sql = result.expression.to_sql(dialect)
    if is_bigquery(dialect):
        assert result_sql == 'ntile(1) over ( order by `b` desc )'

    else:
        assert result_sql == (
            'ntile(1) over ( order by "b" desc RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'
        )


def test_window_lead(dialect):
    left = get_fake_df(dialect, ['a'], ['b', 'c'])
    series_b = left['b']
    result = series_b.sort_values(ascending=False).window_lead()

    result_sql = result.expression.to_sql(dialect)
    column_name = '`b`' if is_bigquery(dialect) else '"b"'
    assert result_sql == (
        f'lead({column_name}, 1, NULL) over ( order by "b" desc RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'
    )


def test_window_first_value(dialect):
    left = get_fake_df(dialect, ['a'], ['b', 'c'])
    series_b = left['b']
    result = series_b.sort_values(ascending=False).window_first_value()

    result_sql = result.expression.to_sql(dialect)
    column_name = '`b`' if is_bigquery(dialect) else '"b"'
    assert result_sql == (
        f'first_value({column_name}) over '
        f'( order by {column_name} desc RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'
    )


def test_window_last_value(dialect):
    left = get_fake_df(dialect, ['a'], ['b', 'c'])
    series_b = left['b']
    result = series_b.sort_values(ascending=False).window_last_value()

    result_sql = result.expression.to_sql(dialect)
    column_name = '`b`' if is_bigquery(dialect) else '"b"'
    assert result_sql == (
        f'last_value({column_name}) over '
        f'( order by {column_name} desc RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'
    )


def test_window_nth_value(dialect):
    left = get_fake_df(dialect, ['a'], ['b', 'c'])
    series_b = left['b']
    result = series_b.sort_values(ascending=False).window_nth_value(10)

    result_sql = result.expression.to_sql(dialect)
    column_name = '`b`' if is_bigquery(dialect) else '"b"'
    assert result_sql == (
        f'nth_value({column_name}, 10) over '
        f'( order by {column_name} desc RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'
    )
