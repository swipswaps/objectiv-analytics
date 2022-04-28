"""
Copyright 2022 Objectiv B.V.
"""
from typing import Any, Tuple, TYPE_CHECKING, Dict, TypeVar

from sqlalchemy.engine import Dialect

from bach.series import Series
from bach.expression import Expression, join_expressions
from bach.types import DtypeOrAlias, get_series_type_from_dtype, StructuredDtype
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
        if not is_bigquery(dialect):
            raise DatabaseNotSupportedException(
                dialect,
                message_override=f'SeriesDict is not supported for {dialect.name}, try SeriesJson.')

        cls._validate_value(value)
        # TODO: proper validation of dtype
        if dtype is None or not isinstance(dtype, dict):
            raise ValueError(f'Dtype is mandatory for converting literal values SeriesDict objects')

        sub_exprs = []
        for key, item in value.items():
            # todo: fully do this in one pass, so we can give better errors
            if key not in dtype:
                raise ValueError(f'Key {key} found in value but not in dtype. '
                                 f'value: {value}, dtype: {dtype}')
            sub_dtype = dtype[key]
            # todo: support dict and array subtypes here
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
    def dtype_to_expression(cls, dialect: Dialect, source_dtype: str, expression: Expression) -> Expression:
        if source_dtype == 'dict':
            return expression
        raise ValueError(f'cannot convert {source_dtype} to dict.')

    @property
    def dict_accessor(self) -> 'DictAccessor':
        # TODO: what is a good name for this property? We already have Series.array. Although that seems like
        #  something we should remove. It probably doesn't make sense to name this `array`
        #  `arr` is perhaps to piratey? Maybe `elements` ?
        return DictAccessor(self)

    @classmethod
    def _validate_value(cls, value: dict):
        """ Check that value is a valid dict value, raises an exception if not the case. """
        if not isinstance(value, dict):
            raise ValueError(f'Type not supported: {type(value)}')
        if not all(isinstance(key, str) for key in value.keys()):
            raise ValueError(f'Non-string keys in dictionary: {value}')


class DictAccessor:
    def __init__(self, series: SeriesDict):
        self._series = series

    def __getitem__(self, key: str):
        # TODO: do we also want to support Series as key?
        engine = self._series.engine
        # TODO: implementation
        raise ValueError(f'Invalid key type: {type(key)}')

    # def len(self) -> 'SeriesInt64':
    #     engine = self._series.engine
    #     # TODO