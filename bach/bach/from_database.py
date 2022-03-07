"""
Copyright 2022 Objectiv B.V.
"""
from typing import Dict

from sqlalchemy.engine import Engine

from bach.types import get_dtype_from_db_dtype
from bach.utils import escape_parameter_characters
from sql_models.model import SqlModel, CustomSqlModelBuilder
from sql_models.sql_generator import to_sql


def get_dtypes_from_model(engine: Engine, node: SqlModel) -> Dict[str, str]:
    """ Create a temporary database table from model and use it to deduce the model's dtypes. """
    new_node = CustomSqlModelBuilder(sql='select * from {{previous}} limit 0')(previous=node)
    select_statement = to_sql(new_node)
    sql = f"""
        create temporary table tmp_table_name on commit drop as
        ({select_statement});
        select column_name, data_type
        from information_schema.columns
        where table_name = 'tmp_table_name'
        order by ordinal_position;
    """
    return _get_dtypes_from_information_schema_query(engine=engine, query=sql)


def get_dtypes_from_table(engine: Engine, table_name: str) -> Dict[str, str]:
    """ Query database to get dtypes of the given table. """
    sql = f"""
        select column_name, data_type
        from information_schema.columns
        where table_name = '{table_name}'
        order by ordinal_position;
    """
    return _get_dtypes_from_information_schema_query(engine=engine, query=sql)


def _get_dtypes_from_information_schema_query(engine: Engine, query: str) -> Dict[str, str]:
    """ Parse information_schema.columns to dtypes. """
    with engine.connect() as conn:
        sql = escape_parameter_characters(conn, query)
        res = conn.execute(sql)
        rows = res.fetchall()
    return {x[0]: get_dtype_from_db_dtype(x[1]) for x in rows}
