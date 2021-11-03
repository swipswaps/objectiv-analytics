"""
Copyright 2021 Objectiv B.V.
"""
from typing import Tuple, Dict

import pandas
from sqlalchemy.engine import Engine

from bach import DataFrame, get_series_type_from_dtype
from bach.expression import quote_identifier
from bach.sql_model import BachSqlModel
from sql_models.model import SqlModelSpec


def from_pandas_store_table(engine: Engine,
                            df: pandas.DataFrame,
                            convert_objects: bool,
                            table_name: str,
                            if_exists: str = 'fail') -> DataFrame:
    """
    See DataFrame.from_pandas_store_table() for docstring.
    """
    # todo add dtypes argument that explicitly let's you set the supported dtypes for pandas columns
    df_copy, index_dtypes, dtypes = _from_pd_shared(df, convert_objects)

    conn = engine.connect()
    df_copy.to_sql(name=table_name, con=conn, if_exists=if_exists, index=False)
    conn.close()

    # Todo, this should use from_table from here on.
    model = BachSqlModel(sql=f'select * from {quote_identifier(table_name)}').instantiate()

    # Should this also use _df_or_series?
    return DataFrame.get_instance(
        engine=engine,
        base_node=model,
        index_dtypes=index_dtypes,
        dtypes=dtypes,
        group_by=None
    )


def from_pandas(engine: Engine, df: pandas.DataFrame, convert_objects: bool) -> DataFrame:
    """
    See DataFrame.from_pandas() for docstring.
    """
    # todo add dtypes argument that explicitly let's you set the supported dtypes for pandas columns
    df_copy, index_dtypes, dtypes = _from_pd_shared(df, convert_objects)

    # Only support case where we have a single index column for now
    if len(index_dtypes) != 1:
        raise NotImplementedError("We only support dataframes with a single column index.")  # for now

    column_series_type = [
        get_series_type_from_dtype(dtype)
        for dtype in list(index_dtypes.values()) + list(dtypes.values())
    ]

    per_row_sql = []
    for row in df_copy.itertuples():
        per_column_sql = []
        # Access the columns in `row` by index rather than by name. Because if a name starts with an
        # underscore (e.g. _index_skating_order) it will not be available as attribute.
        # so we use `row[i]` instead of getattr(row, column_name).
        # start=1 is to account for the automatic index that pandas adds
        for i, series_type in enumerate(column_series_type, start=1):
            val = row[i]
            # to_sql() gives fully escaped sql, including format escaping, so we can use it as raw sql
            val_sql = series_type.value_to_expression(val).to_sql()
            val_sql = SqlModelSpec.escape_format_string(val_sql)
            per_column_sql.append(val_sql)
        per_row_sql.append(f"({', '.join(per_column_sql)})")
    all_values_sql = ',\n'.join(per_row_sql)

    column_names = list(index_dtypes.keys()) + list(dtypes.keys())
    column_names_sql = ", ".join(
        SqlModelSpec.escape_format_string(
            SqlModelSpec.escape_format_string(
                quote_identifier(column_name)
            )
        ) for column_name in column_names
    )

    sql = f'select * from (values \n{all_values_sql}\n) as t({column_names_sql})\n'
    # The raw sql we built could contain format strings, as we
    model = BachSqlModel(sql=sql).instantiate()

    return DataFrame.get_instance(
        engine=engine,
        base_node=model,
        index_dtypes=index_dtypes,
        dtypes=dtypes,
        group_by=None
    )


def _from_pd_shared(
        df: pandas.DataFrame,
        convert_objects: bool
) -> Tuple[pandas.DataFrame, Dict[str, str], Dict[str, str]]:
    """
    Pre-processes the given Pandas DataFrame:
    1) Add index if missing
    2) Convert string columns to string objects (if convert_objects)
    3) Check that the dtypes are supported
    4) extract index_dtypes and dtypes dictionaries

    :return: Tuple:
        * Modified copy of Pandas DataFrame
        * index_dtypes dict
        * dtypes dict
    """
    if df.index.name is None:  # for now only one index allowed todo check this
        index = '_index_0'
    else:
        index = f'_index_{df.index.name}'
    # set the index as a normal column, this makes it easier to convert the dtype
    df_copy = df.rename_axis(index).reset_index()
    if convert_objects:
        df_copy = df_copy.convert_dtypes(convert_integer=False,
                                         convert_boolean=False,
                                         convert_floating=False)
    # todo add support for 'timedelta64[ns]'. pd.to_sql writes timedelta as bigint to sql, so
    # not implemented yet
    supported_types = ['int64', 'float64', 'string', 'datetime64[ns]', 'bool']
    index_dtype = df_copy[index].dtype.name
    if index_dtype not in supported_types:
        raise ValueError(f"index is of type '{index_dtype}', should one of {supported_types}. "
                         f"For 'object' columns convert_objects=True can be used to convert these columns"
                         f"to type 'string'.")
    index_dtypes = {index: index_dtype}
    dtypes = {str(column_name): dtype.name for column_name, dtype in df_copy.dtypes.items()
              if column_name in df.columns}
    unsupported_dtypes = {str(column_name): dtype for column_name, dtype in dtypes.items()
                          if dtype not in supported_types}
    if unsupported_dtypes:
        raise ValueError(f"dtypes {unsupported_dtypes} are not supported, should one of "
                         f"{supported_types}. "
                         f"For 'object' columns convert_objects=True can be used to convert these columns"
                         f"to type 'string'.")
    return df_copy, index_dtypes, dtypes
