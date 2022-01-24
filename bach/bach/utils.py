from typing import NamedTuple, Dict, List
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
