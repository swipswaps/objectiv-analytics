"""
Copyright 2022 Objectiv B.V.
"""
from copy import deepcopy
from typing import Any, Tuple, List, Union, TYPE_CHECKING, TypeVar, Optional, Mapping

from sqlalchemy.engine import Dialect

from bach.series import Series
from bach.expression import Expression, join_expressions
from bach.series.series import ToPandasInfo
from bach.types import DtypeOrAlias, value_to_dtype, get_series_type_from_dtype, StructuredDtype, Dtype, \
    validate_dtype_value
from sql_models.constants import DBDialect
from sql_models.util import is_postgres, DatabaseNotSupportedException, is_bigquery


if TYPE_CHECKING:
    from bach import DataFrameOrSeries


def to_pandas_function_bigquery(data):
    # data is dict of format: `{'_field_1': value, '_field_2': value}`
    return tuple(data[f'_field_{i + 1}'] for i, _key in enumerate(data))


class SeriesTuple(Series):
    dtype = 'tuple'
    dtype_aliases: Tuple[DtypeOrAlias, ...] = tuple()
    supported_db_dtype: Mapping[DBDialect, str] = {
        # TODO: some dynamic stuff here
        # DBDialect.POSTGRES: 'record'
    }
    supported_value_types = (list, )

    to_pandas_info = {
        DBDialect.POSTGRES: ToPandasInfo(dtype='object', function=None),
        DBDialect.BIGQUERY: ToPandasInfo(dtype='object', function=to_pandas_function_bigquery)
    }

    @property
    def to_pandas_info(self) -> Mapping[DBDialect, Optional[ToPandasInfo]]:
        # TODO: this is a hack, probably should make to_pandas_info a function in the super-class
        if is_bigquery(self.engine):
            return {
                DBDialect.BIGQUERY: ToPandasInfo(dtype='object', function=to_pandas_function_bigquery)
            }
        if is_postgres(self.engine):
            def split_func(data):
                # TODO: extremely hackish. probably best not to support this
                #  might have to scrap this whole class, if this is not possible nicely, then this doesn't
                #  add value.

                # data is a string in format '(field1, field2, field3)'
                # strip parenthesis and split on comma. We don't know type information here
                items = data[1:-1].split(',')
                result = []
                for i, item in enumerate(items):
                    sub_dtype = self.instance_dtype[i]
                    if sub_dtype == 'string':
                        result.append(str(item))
                    elif sub_dtype == 'int64':
                        result.append(int(item))
                    elif sub_dtype == 'float64':
                        result.append(float(item))
                return tuple(result)
            return {
                DBDialect.POSTGRES: ToPandasInfo(dtype='object', function=split_func)
            }

        return {}

    @classmethod
    def supported_literal_to_expression(cls, dialect: Dialect, literal: Expression) -> Expression:
        return literal

    @classmethod
    def supported_value_to_literal(
        cls,
        dialect: Dialect,
        value: List[Any],
        dtype: StructuredDtype
    ) -> Expression:
        if not isinstance(dtype, tuple):
            raise ValueError(f'Dtype should be type list. Type(dtype): {type(dtype)}')
        validate_dtype_value(dtype=dtype, value=value)

        sub_exprs = []
        for i, item in enumerate(value):
            sub_dtype = dtype[i]
            series_type = get_series_type_from_dtype(sub_dtype)
            sub_expr = series_type.value_to_expression(
                dialect=dialect,
                value=item,
                dtype=sub_dtype
            )
            sub_exprs.append(sub_expr)

        if is_bigquery(dialect):
            return Expression.construct('STRUCT({})', join_expressions(expressions=sub_exprs, join_str=', '))
        if is_postgres(dialect):
            return Expression.construct('ROW({})', join_expressions(expressions=sub_exprs, join_str=', '))
        raise DatabaseNotSupportedException(dialect)

    @classmethod
    def from_value(
        cls,
        base: 'DataFrameOrSeries',
        value: Any,
        name: str,
        dtype: Optional[StructuredDtype] = None
    ) -> 'Series':
        """

        """
        # We override the parent class here to allow using Series as sub-values in an array
        if not isinstance(dtype, tuple):
            raise ValueError(f'Dtype should be type list. Type(dtype): {type(dtype)}')
        validate_dtype_value(dtype=dtype, value=value)

        # Create a deepcopy to prevent any problems if items in the original change.
        value = deepcopy(value)

        sub_exprs = []
        for i, item in enumerate(value):
            sub_dtype = dtype[i]
            series_type = get_series_type_from_dtype(sub_dtype)

            if isinstance(item, Series):
                if item.base_node != base.base_node:
                    raise ValueError(f'When constructing a tuple from existing Series. '
                                     f'The Series.base_node must match the base.base_node. '
                                     f'Index with incorrect base-node: {i}')
                series = item
            else:
                series = series_type.from_value(
                    base=base,
                    value=item,
                    name=f'item_{i}',
                    dtype=sub_dtype
                )
            sub_exprs.append(series.expression)

        if is_bigquery(base.engine):
            expr = Expression.construct('STRUCT({})', join_expressions(expressions=sub_exprs, join_str=', '))
        elif is_postgres(base.engine):
            expr = Expression.construct('ROW({})', join_expressions(expressions=sub_exprs, join_str=', '))
        else:
            raise DatabaseNotSupportedException(base.engine)
        result = cls.get_class_instance(
            base=base,
            name=name,
            expression=expr,
            group_by=None,
            instance_dtype=dtype
        )
        # TODO: check the stuff that Series.from_value() handles like NULL
        return result

    @classmethod
    def dtype_to_expression(cls, dialect: Dialect, source_dtype: str, expression: Expression) -> Expression:
        # Even when casting from an array to an array, things will be troublesome if instance_dtype doesn't
        # match. So just raise an error.
        raise Exception('Cannot cast a value to an array.')
