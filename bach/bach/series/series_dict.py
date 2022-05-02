"""
Copyright 2022 Objectiv B.V.
"""
from typing import Any, Tuple, TYPE_CHECKING, Dict, TypeVar, Optional

from sqlalchemy.engine import Dialect

from bach.series import Series
from bach.expression import Expression, join_expressions
from bach.types import DtypeOrAlias, get_series_type_from_dtype, StructuredDtype, Dtype, \
    validate_dtype_value, is_structural_dtype
from sql_models.constants import DBDialect
from sql_models.util import DatabaseNotSupportedException, is_bigquery


if TYPE_CHECKING:
    from bach import SeriesInt64, DataFrameOrSeries
    from bach.partitioning import GroupBy


T = TypeVar('T', bound='SeriesDict')


class SeriesDict(Series):
    """
    TODO: docs

    - don't support postgres
    """
    dtype = 'dict'
    dtype_aliases: Tuple[DtypeOrAlias, ...] = tuple()
    supported_db_dtype = {
        DBDialect.BIGQUERY: 'STRUCT'
    }
    supported_value_types = (dict, )

    @classmethod
    def supported_literal_to_expression(cls, dialect: Dialect, literal: Expression) -> Expression:
        return literal

    @classmethod
    def supported_value_to_literal(
            cls,
            dialect: Dialect,
            value: Dict[str, Any],
            dtype: StructuredDtype
    ) -> Expression:
        cls._validate_is_bigquery(dialect)

        if not isinstance(dtype, dict):
            raise ValueError(f'Dtype should be type dict. Type(dtype): {type(dtype)}')
        validate_dtype_value(dtype=dtype, value=value)

        sub_exprs = []
        for key, item in value.items():
            sub_dtype = dtype[key]
            series_type = get_series_type_from_dtype(sub_dtype)
            sub_val = series_type.value_to_expression(
                dialect=dialect,
                value=item,
                dtype=sub_dtype
            )
            sub_expr = Expression.construct('{} as {}', sub_val, Expression.identifier(key))
            sub_exprs.append(sub_expr)
        return Expression.construct('STRUCT({})', join_expressions(expressions=sub_exprs, join_str=', '))

    @classmethod
    def _validate_is_bigquery(cls, dialect):
        if not is_bigquery(dialect):
            raise DatabaseNotSupportedException(
                dialect,
                message_override=f'SeriesDict is not supported for {dialect.name}, try SeriesJson.')

    @classmethod
    def construct(
        cls,
        base: 'DataFrameOrSeries',
        value: Any,
        name: str,
        dtype: StructuredDtype
    ) -> 'Series':
        """
        Similar to from_const(), but allows values that are Series instead of constants.
        """
        dialect = base.engine.dialect
        cls._validate_is_bigquery(dialect)

        if not isinstance(dtype, dict):
            raise ValueError(f'Dtype should be type dict. Type(dtype): {type(dtype)}')
        validate_dtype_value(dtype=dtype, value=value)

        sub_exprs = []
        for key, item in value.items():
            if isinstance(item, Series):
                if item.base_node != base.base_node:
                    raise ValueError(f'When constructing a struct from existing Series. '
                                     f'The Series.base_node must match the base.base_node. '
                                     f'Key with incorrect base-node: {key}')
                sub_val = item.expression
            else:
                sub_dtype = dtype[key]
                series_type = get_series_type_from_dtype(sub_dtype)
                if is_structural_dtype(sub_dtype):
                    series = series_type.construct(
                        base=base,
                        value=item,
                        name=key,
                        dtype=sub_dtype
                    )
                    sub_val = series.expression
                else:
                    sub_val = series_type.value_to_expression(
                        dialect=dialect,
                        value=item,
                        dtype=sub_dtype
                    )
            sub_expr = Expression.construct('{} as {}', sub_val, Expression.identifier(key))
            sub_exprs.append(sub_expr)
        expr = Expression.construct('STRUCT({})', join_expressions(expressions=sub_exprs, join_str=', '))
        result = cls.get_class_instance(
            base=base,
            name=name,
            expression=expr,
            group_by=None,
            instance_dtype=dtype
        )
        return result


    @classmethod
    def dtype_to_expression(cls, dialect: Dialect, source_dtype: str, expression: Expression) -> Expression:
        # Even when casting from a dict to a dict, things will be troublesome if instance_dtype doesn't
        # match. So just raise an error.
        raise Exception('Cannot cast a value to a dictionary.')

    @property
    def elements(self) -> 'DictAccessor':
        # TODO: what is a good name for this property?
        return DictAccessor(self)


class DictAccessor:
    def __init__(self, series: SeriesDict):
        self._series = series

    def __getitem__(self, key: str):
        # TODO: do we also want to support Series as key?
        engine = self._series.engine
        instance_dtype = self._series.instance_dtype
        if key not in instance_dtype:
            raise ValueError(f'Invalid key: {key}. '
                             f'Available keys: {sorted(instance_dtype.keys())}')
        expression = Expression.construct('{}.{}', self._series, Expression.identifier(key))
        sub_dtype = instance_dtype[key]
        if isinstance(sub_dtype, Dtype):
            new_dtype = sub_dtype
            return self._series \
                .copy_override_dtype(dtype=new_dtype) \
                .copy_override(expression=expression)
        # TODO: a bit hacky that we have an if-else here for structural sub-dtypes
        elif isinstance(sub_dtype, dict):
            return self._series \
                .copy_override_type(SeriesDict) \
                .copy_override(instance_dtype=sub_dtype) \
                .copy_override(expression=expression)
        elif isinstance(sub_dtype, list):
            from bach import SeriesArray
            return self._series \
                .copy_override_type(SeriesArray) \
                .copy_override(instance_dtype=sub_dtype) \
                .copy_override(expression=expression)
        else:
            raise Exception('TODO')

        # TODO: implementation
        raise ValueError(f'Invalid key type: {type(key)}')

    # def len(self) -> 'SeriesInt64':
    #     engine = self._series.engine
    #     # TODO
