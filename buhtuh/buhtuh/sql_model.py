"""
Copyright 2021 Objectiv B.V.
"""
from typing import Dict, Any, Union, Sequence, TypeVar

from buhtuh.expression import Expression
from sql_models.model import CustomSqlModel, SqlModel, SqlModelBuilder, SqlModelSpec

TB = TypeVar('TB', bound='BuhTuhSqlModel')


class BuhTuhSqlModel(CustomSqlModel):

    def __call__(self: TB, **values: Union[int, str, Expression, Sequence[Expression],
                                           SqlModel, SqlModelBuilder]) -> SqlModel[TB]:
        """ Only add Expression types in signature """
        return super().__call__(**values)

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
