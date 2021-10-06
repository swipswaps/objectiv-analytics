"""
Copyright 2021 Objectiv B.V.
"""
from typing import List

from buhtuh import get_series_type_from_dtype, BuhTuhDataFrame


def get_fake_df(index_names: List[str], data_names: List[str], dtype='int64'):
    engine = None,
    source_node = None,
    series_type = get_series_type_from_dtype(dtype=dtype)
    index = {
        name: series_type(
            engine=engine, base_node=source_node, index=None, name=name, expression=name
        ) for name in index_names
    }
    data = {
        name: series_type(
            engine=engine, base_node=source_node, index=index, name=name, expression=name
        ) for name in data_names
    }
    return BuhTuhDataFrame(engine=engine, source_node=source_node, index=index, series=data)
