"""
Copyright 2021 Objectiv B.V.
"""
from copy import copy
from typing import Dict, Any, Union, Sequence, TypeVar, Tuple, List, Optional, cast, Mapping, Hashable

from bach.expression import Expression
from sql_models.util import quote_identifier
from sql_models.model import CustomSqlModelBuilder, SqlModel, SqlModelBuilder, SqlModelSpec, Materialization

TB = TypeVar('TB', bound='BachSqlModelBuilder')
T = TypeVar('T', bound='SqlModelSpec')


class BachSqlModelBuilder(CustomSqlModelBuilder):
    """
    Adds two features over the normal CustomSqlModelBuilder:
    1. Support for Expressions and Lists of Expressions as properties
    2. Instantiate BachSqlModel classes instead of regular SqlModel classes. BachSqlModel instances track the
        names of the columns that the query returns.
    """

    def __init__(self, sql: str, name: Optional[str], columns: Tuple[str, ...]):
        super().__init__(sql=sql, name=name)
        self.columns: Tuple[str, ...] = columns

    def __call__(
            self: TB,
            **values: Union[int, str, Expression, Sequence[Expression], SqlModel, SqlModelBuilder]
    ) -> 'BachSqlModel[TB]':
        """ Only add Expression types in signature """
        return cast('BachSqlModel[TB]', super().__call__(**values))

    def instantiate(self: TB) -> 'BachSqlModel[TB]':
        """
        Create an instance of BachSqlModel[TB] based on the properties, references,
        materialization, properties_to_sql, and columns of self.

        If the exact same instance (as determined by result.hash) has been created already by this class,
        then that instance is returned and the newly created instance is discarded.
        """
        if not self.columns:
            raise Exception('Columns not set on BachSqlModelBuilder.')

        # based on the super class's implementation
        self._check_is_complete()
        instance = BachSqlModel(model_spec=self,
                                properties=self.properties,
                                references=self.references,
                                materialization=self.materialization,
                                materialization_name=self.materialization_name,
                                columns=self.columns)
        # If we already once created the exact same instance, then we'll return that one and discard the
        # newly created instance.
        is_new = (
            instance.hash not in self._cache_created_instances
            or not isinstance(self._cache_created_instances[instance.hash], BachSqlModel)
        )
        if is_new:
            self._cache_created_instances[instance.hash] = instance
        return cast(BachSqlModel, self._cache_created_instances[instance.hash])

    def set_columns(self: TB, columns: Tuple[str, ...]):
        self.columns = columns

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


class BachSqlModel(SqlModel[T]):
    """
    SqlModel with meta information about the columns that it produces.
    This additional information needs to be specifically set at model instantiation, it cannot be deduced
    from the sql.

    The column information is not used for sql generation, but can be used by other code
    interacting with the models. The information is not reflected in the `hash`, as it doesn't matter for
    the purpose of sql generation.
    """
    def __init__(self,
                 model_spec: T,
                 properties: Dict[str, Hashable],
                 references: Dict[str, 'SqlModel'],
                 materialization: Materialization,
                 materialization_name: Optional[str],
                 columns: Tuple[str, ...]
                 ):
        """
        Similar to :py:meth:`SqlModel.__init__()`. With one additional parameter: columns, the names of the
        columns that this model's query will return in the correct order.
        """
        self._columns = columns
        super().__init__(
            model_spec=model_spec,
            properties=properties,
            references=references,
            materialization=materialization,
            materialization_name=materialization_name)

    @property
    def columns(self) -> Tuple[str, ...]:
        """ Columns returned by the query of this model, in order."""
        return self._columns

    @classmethod
    def from_sql_model(cls, sql_model: SqlModel, columns: Tuple[str, ...]) -> 'BachSqlModel':
        """ From any SqlModel create a BachSqlModel with the given column definitions. """
        return cls(
            model_spec=sql_model.model_spec,
            properties=sql_model.properties,
            references=sql_model.references,
            materialization=sql_model.materialization,
            materialization_name=sql_model.materialization_name,
            columns=columns
        )


class SampleSqlModel(BachSqlModel):
    """
    A custom SqlModel that simply does select * from a table. In addition to that, this class stores an
    extra property: previous.

    The previous property is not used in the generated sql at all, but can be used to track a previous
    SqlModel. This is useful for how we implemented sampling, as that effectively inserts a sql-model in the
    graph that has no regular reference to the previous node in the graph. By storing the previous node
    here, we can later still reconstruct what the actual previous node was with some custom logic.

    See the DataFrame.sample() implementation for more information
    """
    def __init__(self,
                 table_name: str,
                 previous: SqlModel,
                 columns: Tuple[str, ...],
                 name: str = 'sample_node'):
        self.previous = previous
        sql = 'SELECT * FROM {table_name}'
        super().__init__(
            model_spec=BachSqlModelBuilder(sql=sql, name=name, columns=columns),
            properties={'table_name': quote_identifier(table_name)},
            references={},
            materialization=Materialization.CTE,
            materialization_name=None,
            columns=columns
        )
