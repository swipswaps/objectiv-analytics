"""
Copyright 2021 Objectiv B.V.
"""
from typing import Union, List, Tuple, Optional, Dict, Set

from buhtuh import DataFrameOrSeries, BuhTuhDataFrame, ColumnNames, BuhTuhSeries
from sql_models.model import CustomSqlModel


def _determine_left_on_right_on(
        left: BuhTuhDataFrame,
        right: DataFrameOrSeries,
        on: Optional[ColumnNames],
        left_on: Optional[ColumnNames],  # todo: also support array-like arguments?
        right_on: Optional[ColumnNames],
        left_index: bool,
        right_index: bool) -> Tuple[List[str], List[str]]:
    """
    TODO: comments, tests
    :return: tuple with left_on and right_on
    """
    print(right, on, left_on, right_on, left_index, right_index)

    if (left_on is None) is not (right_on is None):
        raise ValueError('Either both left_on and right_on should be specified, or both should be None.')

    left_cols = set(left.data_columns)
    right_cols = set(right.data_columns)
    default_on = list(left_cols.intersection(right_cols))  # todo: column sorting?
    final_on = on if on is not None else default_on
    final_left_on = _get_x_on(final_on, left_on, 'left_on')
    final_right_on = _get_x_on(final_on, right_on, 'right_on')
    if len(final_left_on) != len(final_right_on):
        raise ValueError(f'Len of left_on ({final_left_on}) does not match that of right_on ({final_right_on}).')
    # TODO: account for left_index and right_index
    return final_left_on, final_right_on


def _get_x_on(on: List[str], x_on: ColumnNames, var_name: str) -> List[str]:
    """ Helper for _determine_left_on_right_on: Give `x_on` as a List[str], or default to `on`. """
    if isinstance(x_on, str):
        return [x_on]
    if isinstance(x_on, list):
        return x_on
    if x_on is None:
        if isinstance(on, str):
            return [on]
        if isinstance(on, list):
            return on
        raise ValueError(f'Type of on is not supported. Type: {type(on)}')
    raise ValueError(f'Type of {var_name} is not supported. Type: {type(x_on)}')


def _determine_result_columns() -> List[str]:
    pass


def merge(
        left: BuhTuhDataFrame,
        right: DataFrameOrSeries,
        how: str,
        on: Union[str, List[str], None],
        left_on: Union[str, List[str],  None],  # todo: also support array-like arguments?
        right_on: Union[str, List[str], None],
        # todo: boolean options not supported. No need to support at this time?
        left_index: bool,
        right_index: bool,
        sort: bool,
        suffixes: Tuple[str, str],
        copy: bool,
        indicator: bool,
        validate: Optional[bool]
) -> BuhTuhDataFrame:
    """
    TOOD: comments
    """
    real_left_on, real_right_on = _determine_left_on_right_on(
        left=left,
        right=right,
        on=on,
        left_on=left_on,
        right_on=right_on,
        left_index=left_index,
        right_index=right_index
    )
    print(real_left_on, real_right_on)
    left_series_list = [left.all_series[label] for label in real_left_on]
    right_series_list = [right.all_series[label] for label in real_right_on]


    # todo: smart stuff needed from here on
    # todo: don't duplicate columns on which we join
    conflicting = set(left.all_series.keys()).intersection(set(right.all_series.keys()))
    new_index_list = _get_column_name_expr_dtype(left.index, conflicting, suffixes[0], 'l')
    new_index_list += _get_column_name_expr_dtype(right.index, conflicting, suffixes[1], 'r')
    new_data_list = _get_column_name_expr_dtype(left.data, conflicting, suffixes[0], 'l')
    new_data_list += _get_column_name_expr_dtype(right.data, conflicting, suffixes[1], 'r')


    conditions = []
    for l_series, r_series in zip(left_series_list, right_series_list):
        conditions.append(
            f'({l_series.get_expression("l")} = {r_series.get_expression("r")})'
        )
    condition_str = ''
    if conditions:
        condition_str = 'on ' + ' and '.join(conditions)

    model_builder = CustomSqlModel(
        name='merge_sql',
        sql='select {index_str}, {data_str} '
            'from {{left_node}} as l {join} '
            'join {{right_node}} as r {condition_str}'
    )
    model = model_builder(
        index_str=', '.join(f'{expr} as {name}' for name, expr, _dtype in new_index_list),
        data_str=', '.join(f'{expr} as {name}' for name, expr, _dtype in new_data_list),
        join=how,
        left_node=left.base_node,
        right_node=right.base_node,
        condition_str=condition_str
    )
    return BuhTuhDataFrame.get_instance(
        engine=left.engine,
        source_node=model,
        index_dtypes={name: dtype for name, _expr, dtype in new_index_list},
        dtypes={name: dtype for name, _expr, dtype in new_data_list}
    )


def _get_column_name_expr_dtype(
        source_series: Dict[str, BuhTuhSeries],
        conflicting_names: Set[str],
        suffix: str,
        table_alias: str):
    """ """
    new_index_list: List[Tuple[str, str, str]] = []
    for index_name, series in source_series.items():
        new_name = index_name
        if index_name in conflicting_names:
            new_name = index_name + suffix
        new_index_list.append((new_name, series.get_expression(table_alias), series.dtype))
    return new_index_list
