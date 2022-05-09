"""
Copyright 2022 Objectiv B.V.
"""
from typing import Any, Tuple, List, Union, TYPE_CHECKING, Optional, Mapping

from sqlalchemy.engine import Dialect

from bach.series import Series
from bach.expression import Expression, join_expressions
from bach.types import DtypeOrAlias, get_series_type_from_dtype, StructuredDtype, Dtype, validate_dtype_value
from sql_models.constants import DBDialect
from sql_models.util import is_postgres, DatabaseNotSupportedException, is_bigquery


if TYPE_CHECKING:
    from bach import SeriesInt64, DataFrameOrSeries


class SeriesArray(Series):
    """
    A Series that represents a list/array-like type and its specific operations.
    On BigQuery this is backed by the ARRAY data type. On other databases this type is not yet supported.

    .. note::
        SeriesArray is only supported on BigQuery.
        On Postgres use SeriesJson for similar functionality.
    """
    dtype = 'array'
    dtype_aliases: Tuple[DtypeOrAlias, ...] = tuple()
    # no static types registered through supported_db_dtype, as exact db_type depends on what kind of data
    # the array holds (e.g. 'ARRAY<INT64>'
    supported_db_dtype: Mapping[DBDialect, str] = {}
    supported_value_types = (list, )

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
        # validate early, and help mypy
        if not isinstance(dtype, list):
            raise ValueError(f'Dtype should be type list. Type(dtype): {type(dtype)}')
        validate_dtype_value(static_dtype=cls.dtype, instance_dtype=dtype, value=value)

        sub_dtype = dtype[0]
        series_type = get_series_type_from_dtype(sub_dtype)
        sub_exprs = [
            series_type.value_to_expression(dialect=dialect, value=item, dtype=sub_dtype)
            for item in value
        ]

        return cls._sub_expressions_to_expression(
            dialect=dialect,
            sub_dtype=sub_dtype,
            sub_expressions=sub_exprs
        )

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

        # validate early, and help mypy
        if not isinstance(dtype, list):
            raise ValueError(f'Dtype should be type list. Type(dtype): {type(dtype)}')
        validate_dtype_value(static_dtype=cls.dtype, instance_dtype=dtype, value=value)

        sub_dtype = dtype[0]
        series_type = get_series_type_from_dtype(sub_dtype)
        sub_exprs = []
        for i, item in enumerate(value):
            if isinstance(item, Series):
                if item.base_node != base.base_node:
                    raise ValueError(f'When constructing an array from existing Series. '
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

        expression = cls._sub_expressions_to_expression(
            dialect=base.engine.dialect,
            sub_dtype=sub_dtype,
            sub_expressions=sub_exprs
        )
        result = cls.get_class_instance(
            engine=base.engine,
            base_node=base.base_node,
            index=base.index,
            name=name,
            expression=expression,
            group_by=None,
            sorted_ascending=None,
            index_sorting=[],
            instance_dtype=dtype
        )
        # TODO: check the stuff that Series.from_value() handles like NULL
        return result

    @staticmethod
    def _sub_expressions_to_expression(
        dialect: Dialect,
        sub_dtype: StructuredDtype,
        sub_expressions: List[Expression]
    ) -> Expression:
        """ Internal function: create an array expression from a list of expressions """
        series_type = get_series_type_from_dtype(sub_dtype)
        if not sub_expressions:
            # Special case: empty array, we need to tell the database the type of the array
            try:
                sub_db_dtype = series_type.get_db_dtype(dialect)
            except DatabaseNotSupportedException:
                raise ValueError("Empty arrays of structured types are not supported.")

            if is_postgres(dialect):
                return Expression.construct(f'ARRAY[]::{sub_db_dtype}[]',)
            if is_bigquery(dialect):
                return Expression.construct(f'ARRAY<{sub_db_dtype}>[]', )
            raise DatabaseNotSupportedException(dialect)

        if is_postgres(dialect):
            return Expression.construct(
                'ARRAY[{}]',
                join_expressions(expressions=sub_expressions, join_str=', ')
            )

        if is_bigquery(dialect):
            return Expression.construct(
                '[{}]',
                join_expressions(expressions=sub_expressions, join_str=', ')
            )

        raise DatabaseNotSupportedException(dialect)

    @classmethod
    def dtype_to_expression(cls, dialect: Dialect, source_dtype: str, expression: Expression) -> Expression:
        # Even when casting from an array to an array, things will be troublesome if instance_dtype doesn't
        # match. So just raise an error.
        raise Exception('Cannot cast a value to an array.')

    @property
    def elements(self) -> 'ArrayAccessor':
        return ArrayAccessor(self)


class ArrayAccessor:
    def __init__(self, series: SeriesArray):
        self._series = series

    def __getitem__(self, key: Union[int, slice]):
        # TODO: do we also want to support Series as key?
        engine = self._series.engine
        if isinstance(key, int):
            if is_postgres(engine):
                # postgres uses 1-based numbering [1]
                # [1] https://www.postgresql.org/docs/current/arrays.html#ARRAYS-ACCESSING
                expr_str = f'{{}}[{key + 1}]'
            elif is_bigquery(engine):
                expr_str = f'{{}}[OFFSET({key})]'
            else:
                raise DatabaseNotSupportedException(engine)

            expression = Expression.construct(expr_str, self._series)
            sub_dtype = self._series.instance_dtype[0]
            if isinstance(sub_dtype, Dtype):
                new_dtype = sub_dtype
                return self._series \
                    .copy_override_dtype(dtype=new_dtype) \
                    .copy_override(expression=expression)
            elif isinstance(sub_dtype, list):
                return self._series \
                    .copy_override(instance_dtype=sub_dtype) \
                    .copy_override(expression=expression)
            elif isinstance(sub_dtype, dict):
                from bach import SeriesDict
                return self._series \
                    .copy_override_type(SeriesDict, instance_dtype=sub_dtype) \
                    .copy_override(expression=expression)
            else:
                raise Exception(f'Unexpected type of sub_dtype. sub_dtype: {sub_dtype}')

        elif isinstance(key, slice):
            # TODO: should be easy on Postgres
            # TODO: could be a lot of work on BigQuery for a nice solution.
            #   or we can just concat a lot of __getitem__s
            return self._series
        else:
            raise ValueError(f'Invalid key type: {type(key)}')

    def len(self) -> 'SeriesInt64':
        engine = self._series.engine
        if is_postgres(engine):
            # array_length on an empty array gives NULL, so use coalesce to always get an integer
            expr_str = 'coalesce(array_length({}, 1), 0)'
        elif is_bigquery(engine):
            expr_str = 'ARRAY_LENGTH({})'
        else:
            raise DatabaseNotSupportedException(engine)
        from bach import SeriesInt64
        return self._series \
            .copy_override_type(SeriesInt64) \
            .copy_override(expression=Expression.construct(expr_str, self._series))
