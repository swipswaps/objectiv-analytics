import itertools
from dataclasses import dataclass
from enum import Enum
from typing import Optional, Union, Sequence, List, NamedTuple

from bach import DataFrameOrSeries, DataFrame, Series, SeriesString
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
    SupportedStats.MEAN: 'mean({col})',
    SupportedStats.STD: 'std({col})',
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

    def _format_stat_stmt(self, stat: SupportedStats, column_name: str) -> str:
        return _SUPPORTED_STATS_X_STMT[stat].format(col=quote_identifier(column_name))


@dataclass
class DataFrameDescriber(FrameDescriber):
    df: DataFrame
    include: Optional[Union[str, Sequence[str]]]
    exclude: Optional[Union[str, Sequence[str]]]

    def describe(self) -> DataFrameOrSeries:
        all_select_stat_expressions = []
        described_columns = []
        # all categorical
        if all(dtype == 'string' for dtype in self.df.dtypes.values()):
            all_select_stat_expressions = self._describe_categorical()
            described_columns = list(self.df.data.keys())

        model = self._get_stats_model(all_select_stat_expressions, described_columns)
        return DataFrame.from_model(engine=self.df.engine, model=model, index=['stat'])

    def _describe_categorical(self) -> List[Expression]:
        all_select_stat_stmts = []
        for stat in SupportedStats.CATEGORICAL.value:
            select_stat_stmts = [f"'{stat}' as {quote_identifier('stat')}"]
            for series in self.df.data.values():
                stat_function = self._format_stat_stmt(SupportedStats(stat), series.name)
                select_stat_stmts.append(f'{stat_function} as {quote_identifier(series.name)}')

            all_select_stat_stmts.append(Expression.construct(fmt=','.join(select_stat_stmts)))

        return all_select_stat_stmts

    def _get_stats_model(
        self,
        all_select_stat_expressions: List[Expression],
        described_columns: List[str],
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
        return model_builder(**col_expressions, base_node=self.df.base_node)


@dataclass
class SeriesDescriber(FrameDescriber):
    series: Series

    def describe(self) -> DataFrameOrSeries:
        ...
