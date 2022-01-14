from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Union, Sequence, List, Type, Dict, Callable

from bach import (
    DataFrame, Series, SeriesString, SeriesAbstractNumeric, DataFrameOrSeries, SeriesBoolean,
    get_series_type_from_dtype,
)
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


_SUPPORTED_STATS_X_STMT: Dict[SupportedStats, Callable[[DataFrame], DataFrame]] = {
    SupportedStats.COUNT: DataFrame.count,
    SupportedStats.MEAN: DataFrame.mean,
    SupportedStats.STD: DataFrame.std,
    SupportedStats.MIN: DataFrame.min,
    SupportedStats.MAX: DataFrame.max,
    SupportedStats.UNIQUE: DataFrame.nunique,
}

FilteringDType = Union[Optional[Union[str, Sequence[str]]], List[Type]]


@dataclass
class DataFrameDescriber:
    df: DataFrame
    include: FilteringDType
    exclude: FilteringDType
    datetime_is_numeric: bool
    percentiles: Optional[Sequence[float]]

    main_stat: SupportedStats = field(init=False)

    STAT_COLUMN_NAME = 'stat'
    RESULT_DECIMALS = 2

    def __post_init__(self) -> None:
        self._process_params()

    def describe(self) -> DataFrame:
        described_columns = []
        for name, series in self.df.data.items():
            if (
                (
                    isinstance(series, (SeriesString, SeriesBoolean))
                    and self.main_stat == SupportedStats.CATEGORICAL
                )
                or (isinstance(series, SeriesAbstractNumeric) and self.main_stat == SupportedStats.NUMERICAL)
            ):
                described_columns.append(name)

        return self._get_stats(described_columns)

    @staticmethod
    def _get_casted_filtering_dtypes(filtering_dtypes: FilteringDType) -> List[Type]:
        casted_dtypes: List[Type] = []
        if not filtering_dtypes:
            return casted_dtypes

        filtering_dtypes = filtering_dtypes if not isinstance(filtering_dtypes, str) else [filtering_dtypes]
        return [get_series_type_from_dtype(dtype) for dtype in filtering_dtypes]

    @staticmethod
    def _rename_agg_columns(
        df: DataFrame, original_columns: List[str], columns_to_describe: List[str],
    ) -> DataFrame:
        column_renames = {
            renamed_col: og_col
            for renamed_col, og_col in zip(df.data_columns, original_columns)
            if og_col in columns_to_describe
        }
        return df.rename(columns=column_renames)  # type: ignore

    def _process_params(self) -> None:
        if not self.df.data:
            raise ValueError('Cannot describe a Dataframe without columns')

        if self.percentiles and any(pt < 0 or pt > 1 for pt in self.percentiles):
            raise ValueError('percentiles should be between 0 and 1.')
        elif not self.percentiles:
            self.percentiles = [0.25, 0.5, 0.75]

        self.include = self._get_casted_filtering_dtypes(self.include)
        self.exclude = self._get_casted_filtering_dtypes(self.exclude)
        self.main_stat = self._get_stat_type_based_on_all_columns()

    def _get_stat_type_based_on_all_columns(self) -> SupportedStats:
        dtypes_series = defaultdict(set)
        for series in self.df.data.values():
            if (
                self.include and not isinstance(series, tuple(self.include))  # type: ignore
                or self.exclude and isinstance(series, tuple(self.exclude))  # type: ignore
            ):
                continue

            if isinstance(series, (SeriesString, SeriesBoolean)):
                dtypes_series[SupportedStats.CATEGORICAL].add(series.name)

            if isinstance(series, SeriesAbstractNumeric):
                dtypes_series[SupportedStats.NUMERICAL].add(series.name)

        # TODO: Allow combined stats for both types
        if dtypes_series[SupportedStats.NUMERICAL]:
            return SupportedStats.NUMERICAL

        if dtypes_series[SupportedStats.CATEGORICAL]:
            return SupportedStats.CATEGORICAL

        raise ValueError('DataFrame or Series has no supported dtype to describe.')

    def _get_stats(self, columns_to_describe: List[str]) -> DataFrame:
        final_df: DataFrame
        for pos, stat in enumerate(self.main_stat.value):
            stat_df = self.df.copy_override()[columns_to_describe]
            stat_df = stat_df.to_frame() if isinstance(stat_df, Series) else stat_df
            original_columns = stat_df.index_columns + stat_df.data_columns

            stat_df = _SUPPORTED_STATS_X_STMT[SupportedStats(stat)](stat_df).materialize()

            stat_df = self._rename_agg_columns(
                df=stat_df, original_columns=original_columns, columns_to_describe=columns_to_describe,
            )  # original column names should remain
            stat_df[self.STAT_COLUMN_NAME] = stat
            stat_df[f'{self.STAT_COLUMN_NAME}_position'] = pos
            final_df = stat_df if pos == 0 else self._append_stats(final_df, stat_df)

        final_df = final_df.sort_values(by=f'{self.STAT_COLUMN_NAME}_position')
        final_df = final_df.round(decimals=self.RESULT_DECIMALS)
        final_df = final_df[[self.STAT_COLUMN_NAME] + columns_to_describe]  # type: ignore
        return final_df.set_index(self.STAT_COLUMN_NAME)  # type: ignore

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
