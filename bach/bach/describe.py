from collections import defaultdict
from dataclasses import dataclass
from enum import Enum
from typing import Optional, Union, Sequence, List

from bach import DataFrameOrSeries, DataFrame, Series, SeriesString, SeriesAbstractNumeric
from bach.expression import Expression
from bach.sql_model import BachSqlModelBuilder, BachSqlModel
from sql_models.util import quote_identifier


def describe_frame(
        frame: DataFrameOrSeries,
        include: Optional[Union[str, Sequence[str]]],
        exclude: Optional[Union[str, Sequence[str]]],
        datetime_is_numeric: bool,
        percentiles: Optional[Sequence[float]],
) -> DataFrameOrSeries:
    ...


class SupportedStats(Enum):
    COUNT = 'count'
    MEAN = 'mean'
    STD = 'std'
    MIN = 'min'
    MAX = 'max'
    UNIQUE = 'unique'
    TOP = 'top'
    FREQ = 'freq'

    NUMERICAL = (
        COUNT, MEAN, STD, MIN, MAX,
    )

    CATEGORICAL = (
        COUNT, UNIQUE,
    )


_SUPPORTED_STATS_X_STMT = {
    SupportedStats.COUNT: 'count({col})',
    SupportedStats.MEAN: 'cast(avg({col}) as double precision)',
    SupportedStats.STD: 'cast(stddev({col}) as double precision)',
    SupportedStats.MIN: 'min({col})',
    SupportedStats.MAX: 'max({col})',
    SupportedStats.UNIQUE: 'count( distinct {col})',
    SupportedStats.TOP: 'top({col})',
    SupportedStats.FREQ: 'freq({col})',
}


@dataclass
class FrameDescriber:
    datetime_is_numeric: bool
    percentiles: Optional[Sequence[float]]

    def describe(self) -> DataFrameOrSeries:
        raise NotImplemented('describe method is not implemented.')

    def _get_stats_model(
        self,
        all_select_stat_expressions: List[Expression],
        described_columns: List[str],
        base_node: BachSqlModel,
    ) -> BachSqlModel[BachSqlModelBuilder]:
        formatted_queries = []
        col_expressions = {}

        for idx, expr in enumerate(all_select_stat_expressions):
            formatted_queries.append(f'select {{columns_{idx}}} from {{{{base_node}}}}')
            col_expressions[f'columns_{idx}'] = expr

        final_query = ' union '.join(formatted_queries)

        model_builder = BachSqlModelBuilder(
            name='stats_sql',
            sql=final_query,
            columns=('stats', *described_columns),
        )
        return model_builder(**col_expressions, base_node=base_node)

    def _format_stat_stmt(self, stat: SupportedStats, column_name: str) -> str:
        return _SUPPORTED_STATS_X_STMT[stat].format(col=quote_identifier(column_name))


@dataclass
class DataFrameDescriber(FrameDescriber):
    df: DataFrame
    include: Optional[Union[str, Sequence[str]]]
    exclude: Optional[Union[str, Sequence[str]]]

    main_stat: SupportedStats = SupportedStats.NUMERICAL

    def __post_init__(self) -> None:
        dtypes_series = defaultdict(set)
        for series in self.df.data.values():
            if isinstance(series, SeriesString):
                dtypes_series[SupportedStats.CATEGORICAL].add(series.name)

            if isinstance(series, SeriesAbstractNumeric):
                dtypes_series[SupportedStats.NUMERICAL].add(series.name)

        include = set()
        exclude = set()
        if len(dtypes_series[SupportedStats.CATEGORICAL]) == len(self.df.data):
            self.main_stat = SupportedStats.CATEGORICAL
            include = dtypes_series[SupportedStats.CATEGORICAL]
            exclude = dtypes_series[SupportedStats.NUMERICAL]

        elif dtypes_series[SupportedStats.NUMERICAL]:
            self.main_stat = SupportedStats.NUMERICAL
            include = dtypes_series[SupportedStats.NUMERICAL]
            exclude = dtypes_series[SupportedStats.CATEGORICAL]

        self.include = list(include | (set(self.include) if self.include else set()))
        self.exclude = list(exclude | set(self.exclude) if self.exclude else set())

        self._validate_params()

    def describe(self) -> DataFrameOrSeries:
        described_columns = [
            series_name
            for series_name in self.df.data
            if series_name in self.include and series_name not in self.exclude
        ]
        all_select_stat_expressions = self._get_stat_expressions(described_columns)

        model = self._get_stats_model(
            all_select_stat_expressions,
            described_columns,
            self.df.base_node,
        )
        return DataFrame.from_model(
            engine=self.df.engine,
            model=model,
            index=['stat'],
        )

    def _validate_params(self) -> None:
        ...

    def _get_stat_expressions(self, columns_to_describe: List[str]) -> List[Expression]:
        all_select_stat_stmts = []
        for stat in self.main_stat.value:
            select_stat_stmts = [f"'{stat}' as {quote_identifier('stat')}"]
            for label in columns_to_describe:
                series = self.df[label]
                stat_function = self._format_stat_stmt(SupportedStats(stat), series.name)
                select_stat_stmts.append(f'{stat_function} as {quote_identifier(series.name)}')

            all_select_stat_stmts.append(Expression.construct(fmt=','.join(select_stat_stmts)))

        return all_select_stat_stmts


@dataclass
class SeriesDescriber(FrameDescriber):
    series: Series

    def describe(self) -> DataFrameOrSeries:
        ...
