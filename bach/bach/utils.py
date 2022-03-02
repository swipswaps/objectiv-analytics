from typing import NamedTuple, Dict, List

from sqlalchemy.engine import Connection

from bach.expression import Expression


class ResultSeries(NamedTuple):
    name: str
    expression: 'Expression'
    dtype: str


def get_result_series_dtype_mapping(result_series: List[ResultSeries]) -> Dict[str, str]:
    return {
        rs.name: rs.dtype
        for rs in result_series
    }


def escape_parameter_characters(conn: Connection, raw_sql: str) -> str:
    """
    Return a modified copy of the given sql with the query-parameter special characters escaped.
    e.g. if the connection uses '%' to mark a parameter, then all occurrences of '%' will be replaced by '%%'
    """
    # for now we'll just assume Postgres and assume the pyformat parameter style is used.
    # When we support more databases we'll need to do something smarter, see
    # https://www.python.org/dev/peps/pep-0249/#paramstyle
    return raw_sql.replace('%', '%%')
