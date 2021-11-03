"""
Copyright 2021 Objectiv B.V.
"""
import pandas
from sqlalchemy.engine import Engine

from bach import DataFrame
from bach.sql_model import BachSqlModel


def from_pandas_store_table(engine: Engine,
                            df: pandas.DataFrame,
                            convert_objects: bool,
                            table_name: str,
                            if_exists: str = 'fail') -> DataFrame:
    """
    See DataFrame.from_pandas_store_table() for docstring.
    """
    df_copy, dtypes, index_dtypes = _from_pd_shared(df, convert_objects)

    # todo add dtypes argument that explicitly let's you set the supported dtypes for pandas columns
    conn = engine.connect()
    df_copy.to_sql(name=table_name, con=conn, if_exists=if_exists, index=False)
    conn.close()

    # Todo, this should use from_table from here on.
    model = BachSqlModel(sql=f'SELECT * FROM {table_name}').instantiate()

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
    # TODO: IMPLEMENT
    table_name = '___tmp__table'
    if_exists = 'replace'

    df_copy, dtypes, index_dtypes = _from_pd_shared(df, convert_objects)

    # todo add dtypes argument that explicitly let's you set the supported dtypes for pandas columns
    conn = engine.connect()
    df_copy.to_sql(name=table_name, con=conn, if_exists=if_exists, index=False)
    conn.close()

    # Todo, this should use from_table from here on.
    model = BachSqlModel(sql=f'SELECT * FROM {table_name}').instantiate()

    # Should this also use _df_or_series?
    return DataFrame.get_instance(
        engine=engine,
        base_node=model,
        index_dtypes=index_dtypes,
        dtypes=dtypes,
        group_by=None
    )


def _from_pd_shared(df: pandas.DataFrame, convert_objects: bool):
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
    return df_copy, dtypes, index_dtypes
