import operator
from abc import ABC, abstractmethod
from copy import copy
from functools import reduce
from typing import Union, List, Optional, Dict, Any, cast, TypeVar, Tuple, Type, TYPE_CHECKING

from bach import DataFrameOrSeries
from bach.series.series import Series
from bach.series.series_numeric import SeriesAbstractNumeric, SeriesFloat64, SeriesInt64
from bach.series.series_string import SeriesString


import pandas
from sqlalchemy.engine import Engine, Dialect
from bach.expression import Expression, MultiLevelExpression
from bach.series.series import ToPandasInfo
from bach.sql_model import BachSqlModel
from bach.types import AllSupportedLiteralTypes, get_series_type_from_dtype
from sql_models.constants import DBDialect, NotSet, not_set
from sql_models.util import DatabaseNotSupportedException, is_postgres, is_bigquery

T = TypeVar('T', bound='SeriesAbstractMultiLevel')

if TYPE_CHECKING:
    from bach.partitioning import GroupBy
    from bach.series import Series, SeriesBoolean
    from bach.dataframe import DataFrame


class SeriesAbstractMultiLevel(Series, ABC):
    def copy_override(
        self: T,
        *,
        engine: Optional[Engine] = None,
        base_node: Optional[BachSqlModel] = None,
        index: Optional[Dict[str, 'Series']] = None,
        name: Optional[str] = None,
        expression: Optional['Expression'] = None,
        group_by: Optional[Union['GroupBy', NotSet]] = not_set,
        sorted_ascending: Optional[Union[bool, NotSet]] = not_set,
        index_sorting: Optional[List[bool]] = None,
        **kwargs,
    ) -> T:
        extra_params = copy(self.levels)
        extra_params.update(kwargs)
        return cast(T, super().copy_override(
            engine=engine,
            base_node=base_node,
            index=index,
            name=name,
            expression=expression,
            group_by=group_by,
            sorted_ascending=sorted_ascending,
            index_sorting=index_sorting,
            **extra_params,
        ))

    @classmethod
    def get_instance(
        cls,
        engine: Engine,
        base_node: BachSqlModel,
        index: Dict[str, 'Series'],
        name: str,
        expression: Expression,
        group_by: Optional['GroupBy'],
        sorted_ascending: Optional[bool] = None,
        index_sorting: List[bool] = None,
        **kwargs,
    ):
        """ INTERNAL: Create an instance of this class. """
        base_params = {
            'engine': engine,
            'base_node': base_node,
            'group_by': group_by,
            'index': index,
            'sorted_ascending': sorted_ascending,
            'index_sorting': [] if index_sorting is None else index_sorting,
        }

        if not (set(cls.get_supported_level_dtypes().keys()) - set(kwargs)):
            sub_levels = kwargs
        else:
            # if levels are not provided, search for them in base node
            # base node MUST contain each referenced column from the class
            missing_references = [
                f'_{name}_{level_name}' for level_name in cls.get_supported_level_dtypes().keys()
                if f'_{name}_{level_name}' not in base_node.columns
            ]
            if missing_references:
                raise ValueError(
                    f'base node must include all referenced columns {missing_references} '
                    f'for the "{cls.__name__}" instance.'
                )
            sub_levels = {
                level_name: get_series_type_from_dtype(dtypes[0]).get_instance(
                    name=level_name,
                    expression=Expression.column_reference(f'_{name}_{level_name}'),
                    **base_params
                )
                for level_name, dtypes in cls.get_supported_level_dtypes().items()
            }

        return cls(
            engine=engine,
            base_node=base_node,
            index=index,
            name=name,
            expression=expression,
            group_by=group_by,
            sorted_ascending=sorted_ascending,
            index_sorting=[] if index_sorting is None else index_sorting,
            **sub_levels,
        )

    @property
    def levels(self) -> Dict[str, Series]:
        return {
            attr: getattr(self, attr) for attr in self.get_supported_level_dtypes().keys()
        }

    @property
    def expression(self) -> Expression:
        """ INTERNAL: Get the expression"""
        return MultiLevelExpression([level.expression for level in self.levels.values()])

    @abstractmethod
    def get_column_expression(self, table_alias: str = None) -> Expression:
        raise NotImplementedError()

    @classmethod
    def get_supported_level_dtypes(cls) -> Dict[str, Tuple[str, ...]]:
        raise NotImplementedError()

    @classmethod
    def from_const(
        cls,
        base: DataFrameOrSeries,
        value: Any,
        name: str,
    ) -> 'Series':
        """
        Create an instance of this class, that represents a column with the given value.
        The returned Series will be similar to the Series given as base. In case a DataFrame is given,
        it can be used immediately with that frame.
        :param base:    The DataFrame or Series that the internal parameters are taken from
        :param value:   The value that this constant Series will have
        :param name:    The name that it will be known by (only for representation)
        """
        if (
            not isinstance(value, dict)
            or not all(level in value for level in cls.get_supported_level_dtypes().keys())
        ):
            raise ValueError(f'value should contain mapping for each {cls.__name__} level')

        result = cls.get_instance(
            engine=base.engine,
            base_node=base.base_node,
            index=base.index,
            name=name,
            expression=Expression.construct(''),
            group_by=None,
            **value,
        )

        return result

    @classmethod
    def dtype_to_expression(cls, dialect: Dialect, source_dtype: str, expression: Expression) -> Expression:
        raise NotImplementedError()

    @classmethod
    def supported_literal_to_expression(cls, dialect: Dialect, literal: Expression) -> Expression:
        raise NotImplementedError()

    @classmethod
    def supported_value_to_literal(cls, dialect: Dialect, value: Any) -> Expression:
        raise NotImplementedError()

    def astype(self, dtype: Union[str, Type]) -> 'Series':
        raise NotImplementedError(f'{self.__class__.__name__} cannot be casted to other types.')

    def equals(self, other: Any, recursion: str = None) -> bool:
        if not isinstance(other, self.__class__):
            return False

        same_levels = all(
            self.levels[level_name].equals(other.levels[level_name], recursion)
            for level_name in self.levels.keys()
        )
        return same_levels and super().equals(other, recursion)

    def isnull(self) -> 'SeriesBoolean':
        all_series = [lvl.isnull() for lvl in self.levels.values()]
        return reduce(operator.and_, all_series)

    def notnull(self) -> 'SeriesBoolean':
        all_series = [lvl.notnull() for lvl in self.levels.values()]
        return reduce(operator.and_, all_series)

    def fillna(self, other: AllSupportedLiteralTypes):
        if (
            not isinstance(other, dict)
            or not all(level in self.levels for level in other.keys())
        ):
            raise ValueError(
                f'"other" should contain mapping for at least one of {self.__class__.__name__} levels'
            )

        self_cp = self.copy()
        for level_name, value in other.items():
            setattr(self_cp, f'_{level_name}', self.levels[level_name].fillna(value))

        return self_cp

    def append(
        self,
        other: Union['Series', List['Series']],
        ignore_index: bool = False,
    ) -> 'Series':
        if not other:
            return self

        levels_df_to_append = []
        for series in other if isinstance(other, list) else [other]:
            if not isinstance(series, self.__class__):
                raise ValueError(f'can only append "{self.dtype}" series to {self.name}')

            level_df = series.copy_override(name=self.name).flatten()
            levels_df_to_append.append(level_df)

        appended_df = self.flatten().append(levels_df_to_append)
        return self.from_const(
            base=appended_df,
            value={
                level_name: appended_df[f'_{self.name}_{level_name}'] for level_name in self.levels.keys()
            },
            name=self.name,
        )

    def flatten(self) -> 'DataFrame':
        from bach.dataframe import DataFrame
        from bach.savepoints import Savepoints
        return DataFrame(
            engine=self.engine,
            base_node=self.base_node,
            index=self.index,
            series={level.name: level for level in self.levels.values()},
            group_by=self.group_by,
            order_by=[],
            savepoints=Savepoints(),
            variables={},
        )

    def _parse_level_value(self, level_name: str, value: Union[AllSupportedLiteralTypes, Series]) -> 'Series':
        supported_dtypes = self.get_supported_level_dtypes()
        if level_name not in supported_dtypes:
            raise ValueError(f'{level_name} is not a supported level in {self.__class__.__name__}.')

        from bach.series.series import const_to_series
        level = const_to_series(self, value=value)

        if not any(
            isinstance(level, get_series_type_from_dtype(dtype)) for dtype in supported_dtypes[level_name]
        ):
            raise ValueError(f'"{level_name}" level should be any of {supported_dtypes[level_name]} dtypes.')

        # level should have same attributes as parent
        return level.copy_override(
            name=f'_{self.name}_{level_name}',
            index=self.index,
            group_by=self.group_by,
            sorted_ascending=self.sorted_ascending,
            index_sorting=self.index_sorting,
        )


def _parse_numeric_interval_value(dialect: DBDialect, value):
    if value is None:
        return value

    # expects a NUMRANGE db type
    if dialect == DBDialect.POSTGRES:
        if value.lower_inc and value.upper_inc:
            closed = 'both'
        elif value.lower_inc:
            closed = 'left'
        else:
            closed = 'right'
        return pandas.Interval(float(value.lower), float(value.upper), closed=closed)

    # expects a dict with interval information
    elif dialect == DBDialect.BIGQUERY:
        expected_keys = ['lower', 'upper', 'bounds']
        if not isinstance(value, dict) or not all(k in value for k in expected_keys):
            raise ValueError(f'{value} has not the expected structure.')

        if value['bounds'] == '[]':
            closed = 'both'
        elif value['bounds'] == '[)':
            closed = 'left'
        else:
            closed = 'right'
        return pandas.Interval(float(value['lower']), float(value['upper']), closed=closed)

    else:
        raise DatabaseNotSupportedException(dialect)


class SeriesNumericInterval(SeriesAbstractMultiLevel):
    dtype = 'numeric_interval'
    dtype_aliases = (pandas.Interval, 'numrange')
    supported_db_dtype = {
        DBDialect.POSTGRES: 'numrange',
        DBDialect.BIGQUERY: 'STRUCT<lower FLOAT64, upper FLOAT64, bounds STRING(2)>'
    }

    supported_value_types = (pandas.Interval, dict)

    to_pandas_info = {
        DBDialect.POSTGRES: ToPandasInfo(
            dtype='object', function=lambda value: _parse_numeric_interval_value(DBDialect.POSTGRES, value),
        ),
        DBDialect.BIGQUERY: ToPandasInfo(
            dtype='object', function=lambda value: _parse_numeric_interval_value(DBDialect.BIGQUERY, value),
        ),
    }

    def __init__(
        self,
        *,
        lower: Union['SeriesAbstractNumeric', float, int],
        upper: Union['SeriesAbstractNumeric', float, int],
        bounds: Union['SeriesString', str],
        **kwargs,
    ) -> None:
        kwargs['expression'] = Expression.construct('')
        super().__init__(**kwargs)

        self._lower = cast(SeriesAbstractNumeric, self._parse_level_value(level_name='lower', value=lower))
        self._upper = cast(SeriesAbstractNumeric, self._parse_level_value(level_name='upper', value=upper))
        self._bounds = cast(SeriesString, self._parse_level_value(level_name='bounds', value=bounds))

    @property
    def lower(self) -> 'SeriesAbstractNumeric':
        return self._lower

    @property
    def upper(self) -> 'SeriesAbstractNumeric':
        return self._upper

    @property
    def bounds(self) -> 'SeriesString':
        return self._bounds

    @classmethod
    def get_supported_level_dtypes(cls) -> Dict[str, Tuple[str, ...]]:
        return {
            'lower': (SeriesFloat64.dtype, SeriesInt64.dtype),
            'upper': (SeriesFloat64.dtype, SeriesInt64.dtype),
            'bounds': (SeriesString.dtype, ),
        }

    def get_column_expression(self, table_alias: str = None) -> Expression:
        # construct final column based on levels
        if is_postgres(self.engine):
            # casting is needed since numrange does not support float64
            base_expr_stmt = f'numrange(cast({{}} as numeric), cast({{}} as numeric), {{}})'

        elif is_bigquery(self.engine):
            # BigQuery has no proper datatype for numeric intervals,
            # therefore we should represent it as a struct
            base_expr_stmt = f'struct({{}} as lower, {{}} as upper, {{}} as bounds)'
        else:
            raise DatabaseNotSupportedException(self.engine)

        expr = Expression.construct(base_expr_stmt, self.lower, self.upper, self.bounds)
        return Expression.construct_expr_as_name(expr, self.name)
