from typing import NamedTuple, Dict, List
from bach.expression import Expression


class ResultColumn(NamedTuple):
    name: str
    expression: 'Expression'
    dtype: str


def get_result_columns_dtype_mapping(result_columns: List[ResultColumn]) -> Dict[str, str]:
    return {
        rc.name: rc.dtype
        for rc in result_columns
    }
