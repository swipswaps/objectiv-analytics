from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Union, Sequence, List

from bach import DataFrame, Series, SeriesString, SeriesAbstractNumeric, DataFrameOrSeries
from bach.sql_model import BachSqlModelBuilder


def describe_frame(
    frame: DataFrameOrSeries,
    include: Optional[Union[str, Sequence[str]]],
    exclude: Optional[Union[str, Sequence[str]]],
    datetime_is_numeric: bool,
    percentiles: Optional[Sequence[float]],
) -> DataFrame:
    describer = DataFrameDescriber(
        df=frame.to_frame() if isinstance(frame, Series) else frame,
        include=include,
        exclude=exclude,
        datetime_is_numeric=datetime_is_numeric,
        percentiles=percentiles,
    )
    return describer.describe()


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
    SupportedStats.COUNT: DataFrame.count,
    SupportedStats.MEAN: DataFrame.mean,
    SupportedStats.STD: DataFrame.std,
    SupportedStats.MIN: DataFrame.min,
    SupportedStats.MAX: DataFrame.max,
    SupportedStats.UNIQUE: DataFrame.nunique,
}


@dataclass
class DataFrameDescriber:
    df: DataFrame
    include: Optional[Union[str, Sequence[str]]]
    exclude: Optional[Union[str, Sequence[str]]]
    datetime_is_numeric: bool
    percentiles: Optional[Sequence[float]]

    STAT_COLUMN_NAME = 'stat'
    main_stat: SupportedStats = field(init=False)

    def __post_init__(self) -> None:
        self._process_params()

    def describe(self) -> DataFrame:
        described_columns = []
        for name, series in self.df.data.items():
            if (
                (isinstance(series, SeriesString) and self.main_stat == SupportedStats.CATEGORICAL)
                or (isinstance(series, SeriesAbstractNumeric) and self.main_stat == SupportedStats.NUMERICAL)
            ):
                described_columns.append(name)

        return self._get_stats(described_columns)

    def _process_params(self) -> None:
        if self.percentiles and any(pt < 0 or pt > 1 for pt in self.percentiles):
            raise ValueError('percentiles should be between 0 and 1.')
        elif not self.percentiles:
            self.percentiles = [0.25, 0.5, 0.75]

        if not self.main_stat:
            self.main_stat = self._get_stat_type_based_on_all_columns()

    def _get_stat_type_based_on_all_columns(self) -> SupportedStats:
        dtypes_series = defaultdict(set)

        for series in self.df.data.values():
            if isinstance(series, SeriesString):
                dtypes_series[SupportedStats.CATEGORICAL].add(series.name)

            if isinstance(series, SeriesAbstractNumeric):
                dtypes_series[SupportedStats.NUMERICAL].add(series.name)

        if (
            len(dtypes_series[SupportedStats.CATEGORICAL]) == len(self.df.data)
            or not dtypes_series[SupportedStats.NUMERICAL]
        ):
            return SupportedStats.CATEGORICAL
        elif dtypes_series[SupportedStats.NUMERICAL]:
            return SupportedStats.NUMERICAL

        raise ValueError('DataFrame or Series has no supported dtype for description.')

    def _get_stats(self, columns_to_describe: List[str]) -> DataFrame:
        final_df: Optional[DataFrame] = None
        for pos, stat in enumerate(self.main_stat.value):
            stat_df = self.df.copy_override()[columns_to_describe]
            stat_df = _SUPPORTED_STATS_X_STMT[SupportedStats(stat)](stat_df)
            stat_df = stat_df.materialize()
            stat_df = stat_df.rename(
                columns=dict(zip(stat_df.data.keys(), columns_to_describe)),  # original column names should remain
            )
            stat_df[self.STAT_COLUMN_NAME] = stat
            stat_df[f'{self.STAT_COLUMN_NAME}_position'] = pos
            final_df = stat_df if not final_df else self._append_stats(final_df, stat_df)

        final_df = final_df.sort_values(by=f'{self.STAT_COLUMN_NAME}_position')
        final_df = final_df[[self.STAT_COLUMN_NAME] + columns_to_describe]
        return final_df.set_index(self.STAT_COLUMN_NAME)[columns_to_describe]

    def _append_stats(self, stats_1_df: DataFrame, stats_2_df: DataFrame) -> DataFrame:
        # TODO: Implement DataFrame.append
        df1 = stats_1_df.materialize(node_name='main_stats')
        df2 = stats_2_df.materialize(node_name='stats_to_append')
        sql = '''
            select * from {{main_stats}}
            union
            select * from {{stats_to_append}}
        '''
        model_builder = BachSqlModelBuilder(
            name='stats_sql',
            sql=sql,
            columns=tuple(stats_1_df.data.keys()),
        )
        model = model_builder(main_stats=df1.base_node, stats_to_append=df2.base_node)
        return DataFrame.from_model(engine=self.df.engine, model=model, index=[])
