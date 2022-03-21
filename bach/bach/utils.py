from typing import NamedTuple, Dict, List, Set
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


def get_merged_series_dtype(dtypes: Set[str]) -> str:
    """
    returns a final dtype when trying to combine series with different dtypes
    """
    from bach import get_series_type_from_dtype, SeriesAbstractNumeric
    if len(dtypes) == 1:
        return dtypes.pop()
    elif all(
        issubclass(get_series_type_from_dtype(dtype), SeriesAbstractNumeric)
        for dtype in dtypes
    ):
        return 'float64'

    # default casting will be as text, this way we avoid any SQL errors
    # when merging different db types into a column
    return 'string'


def escape_parameter_characters(conn: Connection, raw_sql: str) -> str:
    """
    Return a modified copy of the given sql with the query-parameter special characters escaped.
    e.g. if the connection uses '%' to mark a parameter, then all occurrences of '%' will be replaced by '%%'
    """
    # for now we'll just assume Postgres and assume the pyformat parameter style is used.
    # When we support more databases we'll need to do something smarter, see
    # https://www.python.org/dev/peps/pep-0249/#paramstyle
    return raw_sql.replace('%', '%%')
