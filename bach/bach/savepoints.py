"""
Copyright 2021 Objectiv B.V.
"""
import re
from typing import NamedTuple, Dict, Optional, List, Set, Sequence

from sqlalchemy.engine import Engine

from bach import DataFrame
from sql_models.model import Materialization, SqlModel, CustomSqlModelBuilder
from sql_models.sql_generator import to_sql_materialized_nodes
from sql_models.util import quote_identifier


class SavepointInfo(NamedTuple):
    """
    Class to represent a savepoint
    """
    name: str
    df_original: 'DataFrame'
    materialization: Materialization
    written_to_db: Set[str]


class CreatedObject(NamedTuple):
    name: str
    materialization: Materialization


class SqlExecutionResult(NamedTuple):
    created: List[CreatedObject]
    data: Dict[str, List[tuple]]


class Savepoints:

    def __init__(self):
        self._entries: Dict[str, SavepointInfo] = {}

    def add_df(self, name: str, df: DataFrame, materialization: Materialization):
        """

        INTERNAL

        Add the DataFrame as a savepoint.

        Generally one would use :py:meth:`bach.DataFrame.set_savepoint()`

        :TODO: comments
        """
        if name in self._entries:
            raise ValueError(f'Savepoint with name "{name}" already exists.')
        if name is None or not re.match('^[a-zA-Z0-9_]+$', name):
            raise ValueError(f'Name must match ^[a-zA-Z0-9_]+$, name: "{name}"')
        self._entries[name] = SavepointInfo(
            name=name,
            df_original=df.copy(),
            materialization=materialization,
            written_to_db=set()
        )

    def get_df(self, savepoint_name: str) -> 'DataFrame':
        """
        Return a copy of the original DataFrame that was saved with the given name.
        """
        return self._entries[savepoint_name].df_original.copy()

    def get_materialized_df(self, engine: Engine, savepoint_name: str) -> 'DataFrame':
        """
        Return the DataFrame that was saved with the given name.
        """
        info = self._entries[savepoint_name]
        if engine.url not in info.written_to_db:
            raise ValueError(f'Savepoint "{savepoint_name}" has not been materialized with the given'
                             f'engine.url ({engine.url}). '
                             f'Use get_df() to get the original DataFrame, or materialize the savepoint in '
                             f'a database by calling execute_sql().')
        full_graph = self._get_combined_graph()
        graph = full_graph.references[f'ref_{info.name}']
        return info.df_original\
            .copy_override_base_node(base_node=graph)\
            .copy_override(engine=engine)

    def list(self) -> List[SavepointInfo]:
        return list(self._entries.values())

    def execute_sql(self, engine: Engine, overwrite: bool = False) -> SqlExecutionResult:
        """

        """
        sql_statements = self.to_sql()
        result_created = []
        result_data = {}

        drop_statements = []  # drop table/view statements that should run first
        if overwrite:
            for name in sql_statements.keys():
                info = self._entries[name]
                if info.materialization == Materialization.TABLE:
                    drop_statements.append(f'drop table if exists {quote_identifier(name)}')
                elif info.materialization == Materialization.VIEW:
                    drop_statements.append(f'drop view if exists {quote_identifier(name)}')

        with engine.connect() as conn:
            with conn.begin() as transaction:
                # This is a bit fragile. Drop statements might fail if other objects (which we might not
                # consider) depend on a view/table, or if the object type (view/table) is different than we
                # assume. For now that's just the way it is, the user will get an error.
                drop_sql = '; '.join(reversed(drop_statements))
                if drop_sql:
                    conn.execute(drop_sql)

                for name, statement in sql_statements.items():
                    info = self._entries[name]
                    query_result = conn.execute(statement)
                    if info.materialization == Materialization.QUERY:
                        # We return the combined result of all sql statements with QUERY materialization
                        # TODO: change format so it includes column names?
                        #  Perhaps return full pandas DFs, similar to what to_pandas() does?
                        result_data[name] = list(query_result)
                    elif info.materialization in (Materialization.TABLE, Materialization.VIEW):
                        result_created.append(CreatedObject(name=name, materialization=info.materialization))
                    info.written_to_db.add(engine.url)
                transaction.commit()
        return SqlExecutionResult(
            created=result_created,
            data=result_data
        )

    def to_sql(self) -> Dict[str, str]:
        """
        Generate the sql for all save-points
        :return: dictionary mapping the name of each savepoint to the sql for that savepoint.
        """
        graph = self._get_combined_graph()
        sqls = to_sql_materialized_nodes(start_node=graph, include_start_node=False)
        return sqls

    def _get_combined_graph(self) -> SqlModel:
        """
        Get a single graph that contains all savepoints.

        The savepoints are referred by the returned sql-model as 'ref_{name}'.
        """
        entries = list(self._entries.values())
        references: Dict[str, SqlModel] = {
            f'ref_{entry.name}': entry.df_original.base_node for entry in entries
        }
        # Create one graph with all entries
        graph = _get_virtual_node(references)

        # Now update all the nodes that represent an entry, to have the correct materialization
        for entry in entries:
            reference_path = (f'ref_{entry.name}', )
            graph = graph.set_materialization_name(reference_path, materialization_name=entry.name)
            graph = graph.set_materialization(reference_path, materialization=entry.materialization)
        return graph


def _get_virtual_node(references: Dict[str, SqlModel]) -> SqlModel:
    # TODO: move this to sqlmodel?
    # reference_sql is of form "{{ref_0}}, {{1}}, ..., {{n}}"
    reference_sql = ', '.join(f'{{{{{ref_name}}}}}' for ref_name in references.keys())
    sql = f'select * from {reference_sql}'
    return CustomSqlModelBuilder(name='virtual_node', sql=sql)\
        .set_materialization(Materialization.VIRTUAL_NODE)\
        .set_values(**references)\
        .instantiate()
