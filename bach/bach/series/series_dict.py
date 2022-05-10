"""
Copyright 2022 Objectiv B.V.
"""
from typing import Any, Tuple, TYPE_CHECKING, Dict, Optional, Mapping

from sqlalchemy.engine import Dialect

from bach.series import Series
from bach.expression import Expression, join_expressions
from bach.types import DtypeOrAlias, get_series_type_from_dtype, StructuredDtype, Dtype, validate_dtype_value
from sql_models.constants import DBDialect
from sql_models.util import DatabaseNotSupportedException, is_bigquery


if TYPE_CHECKING:
    from bach import DataFrameOrSeries


class SeriesDict(Series):
    """
    A Series that represents a dictionary-like type and its specific operations.
    On BigQuery this is backed by the STRUCT data type. On other databases this type is not supported.

    .. note::
        SeriesDict is only supported on BigQuery.
        On Postgres use SeriesJson for similar functionality.
    """
    dtype = 'dict'
    dtype_aliases: Tuple[DtypeOrAlias, ...] = tuple()
    # no static types registered through supported_db_dtype, as exact db_type depends on what kind of data
    # the dict/struct holds (e.g. 'STRUCT< xINT64>'
    supported_db_dtype: Mapping[DBDialect, str] = {}
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
        # validate early, and help mypy
        cls._validate_is_bigquery(dialect)
        if not isinstance(dtype, dict):
            raise ValueError(f'Dtype should be type dict. Type(dtype): {type(dtype)}')
        validate_dtype_value(static_dtype=cls.dtype, instance_dtype=dtype, value=value)

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
    def from_value(
        cls,
        base: 'DataFrameOrSeries',
        value: Dict[str, Any],
        name: str,
        dtype: Optional[StructuredDtype] = None
    ) -> 'Series':
        """
        Create an instance of this class, that represents a column with the given dict as value.
        The given base Series/DataFrame will be used to set the engine, base_node, and index.

        :param base:    The DataFrame or Series that the internal parameters are taken from
        :param value:   The value that this constant Series will have. Cannot be null.
        :param name:    The name that it will be known by (only for representation)
        :param dtype:   instance dtype, mandatory. Should be a dict, describing the structure of value.
        """
        # We override the parent class here to allow using Series as sub-values in a dict
        cls._validate_is_bigquery(base.engine.dialect)

        # validate early, and help mypy
        if not isinstance(dtype, dict):
            raise ValueError(f'Dtype should be type dict. Type(dtype): {type(dtype)}')
        if value is None:
            raise ValueError(f'None values are not supported in from_value() by this class.')
        validate_dtype_value(static_dtype=cls.dtype, instance_dtype=dtype, value=value)

        sub_exprs = []
        for key, item in value.items():
            if isinstance(item, Series):
                if item.base_node != base.base_node:
                    raise ValueError(f'When constructing a struct from existing Series. '
                                     f'The Series.base_node must match the base.base_node. '
                                     f'Key with incorrect base-node: {key}')
                series = item
            else:
                sub_dtype = dtype[key]
                series_type = get_series_type_from_dtype(sub_dtype)
                series = series_type.from_value(
                    base=base,
                    value=item,
                    name=key,
                    dtype=sub_dtype
                )
            sub_expr = Expression.construct('{} as {}', series.expression, Expression.identifier(key))
            sub_exprs.append(sub_expr)
        expr = Expression.construct('STRUCT({})', join_expressions(expressions=sub_exprs, join_str=', '))
        result = cls.get_class_instance(
            engine=base.engine,
            base_node=base.base_node,
            index=base.index,
            name=name,
            expression=expr,
            group_by=None,
            sorted_ascending=None,
            index_sorting=[],
            instance_dtype=dtype
        )
        return result

    @classmethod
    def dtype_to_expression(cls, dialect: Dialect, source_dtype: str, expression: Expression) -> Expression:
        # Even when casting from a dict to a dict, things will be troublesome if instance_dtype doesn't
        # match. So just raise an error.
        raise Exception('Cannot cast a value to a dictionary.')

    @classmethod
    def _validate_is_bigquery(cls, dialect):
        if not is_bigquery(dialect):
            raise DatabaseNotSupportedException(
                dialect,
                message_override=f'SeriesDict is not supported for {dialect.name}, '
                                 f'try SeriesJson for similar functionality.')

    @property
    def elements(self) -> 'DictAccessor':
        """ Accessor to interact with the elements in the dictionary. """
        return DictAccessor(self)


class DictAccessor:
    def __init__(self, series: SeriesDict):
        self._series = series
        # Below checks on self._series.instance_dtype are not strictly needed, but it helps mypy. We checked
        # this in Series.__init__(), by calling validate_instance_dtype()
        if not isinstance(self._series.instance_dtype, dict):
            raise Exception('Found type: {self._series.instance_dtype}')
        self._instance_dtype: Dict[str, Any] = self._series.instance_dtype

    def __getitem__(self, key: str):
        # TODO: do we also want to support Series as key?
        engine = self._series.engine
        instance_dtype = self._instance_dtype
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
        elif isinstance(sub_dtype, dict):
            return self._series \
                .copy_override_type(SeriesDict, instance_dtype=sub_dtype) \
                .copy_override(expression=expression)
        elif isinstance(sub_dtype, list):
            from bach import SeriesArray
            return self._series \
                .copy_override_type(SeriesArray, instance_dtype=sub_dtype) \
                .copy_override(expression=expression)
        else:
            raise Exception(f'Unsupported structural type: {sub_dtype}')

    # def len(self) -> 'SeriesInt64':
    #     engine = self._series.engine
    #     # TODO
