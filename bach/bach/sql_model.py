"""
Copyright 2021 Objectiv B.V.
"""
from typing import Dict, Any, Union, Sequence, TypeVar, Tuple, Hashable, Optional, cast

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

    def set_values(self: TB, **values: Union[int, str, Expression, Sequence[Expression],
                                             SqlModel, SqlModelBuilder]) -> TB:
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


class BachSqlModel(SqlModel[T]):
    """
    SqlModel with meta information about the columns that it produces.
    This additional information needs to be specifically set at model instantiation, it cannot be deduced
    from the sql.

    The column information is not used for sql generation, but can be used by other code
    interacting with the models. The information is not reflected in the `hash`, because for the purpose of
    sql generation it doesn't matter and

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
