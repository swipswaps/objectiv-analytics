"""
Copyright 2021 Objectiv B.V.
"""
from copy import copy
from typing import Dict, Any, Union, Sequence, TypeVar, List, Optional, cast, Mapping

from bach.expression import Expression
from sql_models.util import quote_identifier
from sql_models.model import CustomSqlModelBuilder, SqlModel, SqlModelBuilder, SqlModelSpec, Materialization

TB = TypeVar('TB', bound='BachSqlModelBuilder')


class BachSqlModelBuilder(CustomSqlModelBuilder):

    def __call__(self: TB,
                 **values: Union[int, str, Expression, Sequence[Expression], SqlModel, SqlModelBuilder]
                 ) -> SqlModel[TB]:
        """ Only add Expression types in signature """
        return super().__call__(**values)

    def set_values(self: TB,
                   **values: Union[int, str, Expression, Sequence[Expression], SqlModel, SqlModelBuilder]
                   ) -> TB:
        """
        Set references that are required to resolve the entire model tree
        """
        for k, v in values.items():
            refs = []
            if isinstance(v, list) and all(isinstance(li, Expression) for li in v):
                refs = [value.get_references() for value in v]
            elif isinstance(v, Expression):
                refs = [v.get_references()]

            for r in refs:
                for rk, rv in r.items():
                    self._references[rk] = rv

        return super().set_values(**values)

    @staticmethod
    def properties_to_sql(properties: Dict[str, Any]) -> Dict[str, str]:
        """
        We accept Expressions and lists of expressions as properties too, and they need to escape
        themselves if they want to. This allows them to carry references that will be completed
        in the reference phase in _single_model_to_sql() from sql_generator.py
        """
        rv = {}
        for k, v in properties.items():
            if isinstance(v, list) and all(isinstance(li, Expression) for li in v):
                rv[k] = ", ".join([value.to_sql() for value in v])
            elif isinstance(v, Expression):
                rv[k] = v.to_sql()
            else:
                rv[k] = SqlModelSpec.escape_format_string(str(v))
        return rv


class CurrentNodeSqlModelBuilder(SqlModelBuilder):

    def __init__(self,
                 name: str,
                 columns: List[Expression],
                 where_clause: Optional[Expression],
                 group_by_clause: Optional[Expression],
                 having_clause: Optional[Expression],
                 order_by_clause: Optional[Expression],
                 limit_clause: Expression):

        columns_str = ', '.join(expr.to_sql() for expr in columns)
        where_str = where_clause.to_sql() if where_clause else ''
        group_by_str = group_by_clause.to_sql() if group_by_clause else ''
        having_str = having_clause.to_sql() if having_clause else ''
        order_by_str = order_by_clause.to_sql() if order_by_clause else ''
        limit_str = limit_clause.to_sql() if limit_clause else ''

        sql = f"""
            select {columns_str}
            from {{{{prev}}}}
            {where_str}
            {group_by_str}
            {having_str}
            {order_by_str}
            {limit_str}
            """

        # super().__init__() will check that the references and properties don't overlap. So we must
        #  have self.sql in place before we call it
        self._sql = sql
        self._generic_name = name
        super().__init__()

        # Add all references found in the Expressions to self.references
        all_expressions = cast(List[Optional[Expression]], copy(columns))
        all_expressions += [where_clause, group_by_clause, having_clause, order_by_clause, limit_clause]
        expression_references = self._get_expression_references(all_expressions)
        # help mypy by casting `Union[SqlModelBuilder, SqlModel]` to `SqlModel`
        self._check_reference_conflicts(self._references, expression_references)
        self._references.update(expression_references)

    @property
    def sql(self):
        return self._sql

    @property
    def generic_name(self):
        return self._generic_name

    def _get_expression_references(self, expressions: List[Optional[Expression]]) -> Dict[str, SqlModel]:
        """ Util function: Get a dictionary of reference name to referred SqlModel from the expressions. """
        result: Dict[str, SqlModel] = {}
        for expr in expressions:
            if expr is not None:
                references = expr.get_references()
                self._check_reference_conflicts(result, references)
                result.update(references)
        return result

    @staticmethod
    def _check_reference_conflicts(left: Mapping[str, Any], right: Mapping[str, Any]) -> None:
        """
        Util function: Check that two dicts with references don't have conflicting values.
        """
        for ref_name, model in right.items():
            if left.get(ref_name) not in (None, model):
                # This should never happen. We have this check as a backstop assertion to fail early
                raise Exception(f'Encountered reference {ref_name} before, but with a different value: '
                                f'{left.get(ref_name)} != {model}')


class SampleSqlModel(SqlModel):
    """
    A custom SqlModel that simply does select * from a table. In addition to that, this class stores an
    extra property: previous.

    The previous property is not used in the generated sql at all, but can be used to track a previous
    SqlModel. This is useful for how we implemented sampling, as that effectively inserts a sql-model in the
    graph that has no regular reference to the previous node in the graph. By storing the previous node
    here, we can later still reconstruct what the actual previous node was with some custom logic.

    See the DataFrame.sample() implementation for more information
    """
    def __init__(self, table_name: str, previous: SqlModel, name: str = 'sample_node'):
        self.previous = previous
        sql = 'SELECT * FROM {table_name}'
        super().__init__(
            model_spec=CustomSqlModelBuilder(sql=sql, name=name),
            properties={'table_name': quote_identifier(table_name)},
            references={},
            materialization=Materialization.CTE
        )
