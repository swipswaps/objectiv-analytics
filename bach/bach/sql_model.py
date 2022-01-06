"""
Copyright 2021 Objectiv B.V.
"""
import typing
from typing import Dict, TypeVar, Tuple, List, Optional, Mapping, Hashable

from bach.expression import Expression, get_expression_references, get_variable_token_names, VariableToken
from bach.types import value_to_dtype, get_series_type_from_dtype
from sql_models.util import quote_identifier
from sql_models.model import CustomSqlModelBuilder, SqlModel, SqlModelBuilder, SqlModelSpec, Materialization

T = TypeVar('T', bound='SqlModelSpec')


if typing.TYPE_CHECKING:
    # TODO: move this somewhere where we don't need to do this if?
    from bach.dataframe import DtypeValuePair


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
                 properties: Mapping[str, Hashable],
                 references: Mapping[str, 'SqlModel'],
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
            # TODO: Use SqlModelBuilder, or create some base spec class?
            model_spec=CustomSqlModelBuilder(sql=sql, name=name),
            properties={'table_name': quote_identifier(table_name)},
            references={},
            materialization=Materialization.CTE,
            materialization_name=None,
            columns=columns
        )


class CurrentNodeSqlModel(BachSqlModel):
    def __init__(self, *,
                 name: str,
                 column_names: Tuple[str, ...],
                 column_exprs: List[Expression],
                 where_clause: Optional[Expression],
                 group_by_clause: Optional[Expression],
                 having_clause: Optional[Expression],
                 order_by_clause: Optional[Expression],
                 limit_clause: Expression,
                 previous_node: BachSqlModel,
                 variables: Dict[str, 'DtypeValuePair']):

        columns_str = ', '.join(expr.to_sql() for expr in column_exprs)
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

        # Add all references found in the Expressions to self.references
        nullable_expressions = [where_clause, group_by_clause, having_clause, order_by_clause, limit_clause]
        all_expressions = column_exprs + [expr for expr in nullable_expressions if expr is not None]
        expression_references = get_expression_references(all_expressions)
        references: Dict[str, SqlModel] = {'prev': previous_node}
        # todo: call _check_reference_conflicts() ?
        references.update(expression_references)

        properties = get_variable_values_sql(variables, all_expressions)

        super().__init__(
            model_spec=CustomSqlModelBuilder(sql=sql, name=name),
            properties=properties,
            references=references,
            materialization=Materialization.CTE,
            materialization_name=None,
            columns=column_names
        )


def get_variable_values_sql(
        variable_values: Dict[str, 'DtypeValuePair'],
        expressions: List['Expression']
) -> Dict[str, str]:
    """
    Take a dictionary with variable_values and return a dict with the variable values as sql.

    The return dictinary is filtered. It only contains variables for which at least one of the expressions
    contains a VariableToken with that name.

    :param variable_values: Mapping of variable to value.
    :param expressions: list of expressions. Only variable that occur in these expressions are returned.
    :return: Dictionary mapping variable name to sql
    """
    result = {}
    available_tokens = get_variable_token_names(expressions)
    filtered_variables = {name: dv for name, dv in variable_values.items() if name in available_tokens}
    for name, dv in filtered_variables.items():
        dtype = value_to_dtype(dv.value)
        if dtype != dv.dtype:  # should never happen
            Exception(f'Dtype of value {dv.value} {dtype} does not match registered dtype {dv.dtype}')
        property_name = VariableToken.dtype_name_to_sql(dtype=dtype, name=name)
        series_type = get_series_type_from_dtype(dtype)
        # TODO: `expr` likely contains redundant 'CASTS', only get the actual value.
        #  The casts might be confusing when we export this in someway where a user can see the filled-in
        #  values
        expr = series_type.supported_value_to_expression(dv.value)
        sql = expr.to_sql()
        result[property_name] = sql
    return result
