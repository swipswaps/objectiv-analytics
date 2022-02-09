import itertools
from collections import defaultdict
from enum import Enum
from typing import Optional, Union, Sequence, List, Type, Tuple

from bach import (
    DataFrame, SeriesString, SeriesAbstractNumeric, DataFrameOrSeries,
    get_series_type_from_dtype, SeriesAbstractDateTime,
)
from bach.concat import DataFrameConcatOperation
from bach.expression import Expression


class SupportedStats(Enum):
    COUNT = 'count'
    MEAN = 'mean'
    STD = 'std'
    MIN = 'min'
    MAX = 'max'
    NUNIQUE = 'nunique'
    MODE = 'mode'


# TODO: Remove this constant when boolean aggregations bug (min, max) is fixed.
_SUPPORTED_SERIES_TYPES: Tuple[Type, ...] = (
    SeriesAbstractNumeric, SeriesString, SeriesAbstractDateTime,
)


def _get_casted_filtering_dtypes(
    filtering_dtypes: Optional[Union[str, Sequence[str]]],
) -> Tuple[Type, ...]:
    """    returns a tuple containing the series type of each dtype
    """
    if not filtering_dtypes:
        return tuple()

    if filtering_dtypes == 'all':
        return _SUPPORTED_SERIES_TYPES

    filtering_dtypes = filtering_dtypes if not isinstance(filtering_dtypes, str) else [filtering_dtypes]
    return tuple(get_series_type_from_dtype(dtype) for dtype in filtering_dtypes)


class DescribeOperation:
    """
    In order to instantiate this class you should provide the following params:
    obj: a DataFrame or Series to be described. If a series is give, it will be transformed into a DataFrame
    include: A dtype or list of dtypes to be described. If nothing is provided,
    only numerical series will be considered
    exclude: A dtype or list of dtype to be excluded from analysis.
    datetime_is_numeric: A boolean specifying if datetime series should be treated as numeric columns (not supported)
    percentiles: List-like of numbers between 0-1. If nothing is provided,
    default [.25, .5, .75] will be calculated
    """
    df: DataFrame
    include: Tuple[Type, ...]
    exclude: Tuple[Type, ...]
    datetime_is_numeric: bool
    percentiles: Sequence[float]

    STAT_SERIES_NAME = '__stat'
    RESULT_DECIMALS = 2

    def __init__(
        self,
        obj: DataFrameOrSeries,
        include: Optional[Union[str, Sequence[str]]] = None,
        exclude: Optional[Union[str, Sequence[str]]] = None,
        datetime_is_numeric: bool = False,
        percentiles: Optional[Sequence[float]] = None,
    ) -> None:
        self.df = obj.copy() if isinstance(obj, DataFrame) else obj.to_frame()
        if not self.df.data:
            raise ValueError('Cannot describe a Dataframe without columns')

        self.include = _get_casted_filtering_dtypes(include)
        self.exclude = _get_casted_filtering_dtypes(exclude)

        self.datetime_is_numeric = datetime_is_numeric
        self.percentiles = percentiles or [0.25, 0.5, 0.75]

        if self.percentiles and any(pt < 0 or pt > 1 for pt in self.percentiles):
            raise ValueError('percentiles should be between 0 and 1.')

    def __call__(self) -> DataFrame:
        """
        Generates an aggregated dataframe per stat and concatenates all results into a new dataframe
        containing all descriptive statistics of the dataset.

        Values are sorted based on the position of the stat in _SERIES_CLS_X_SUPPORTED_STAT
        """
        all_stats_df = []
        for pos, stat in enumerate(SupportedStats):
            stat_df = self._calculate_stat(stat=stat, stat_position=pos)
            if stat_df:
                all_stats_df.append(stat_df)

        percentiles_df = self._calculate_percentiles()
        if percentiles_df:
            all_stats_df.append(percentiles_df)

        describe_df = DataFrameConcatOperation(objects=all_stats_df)()
        describe_df = describe_df.sort_values(by=f'{self.STAT_SERIES_NAME}_position')
        describe_df = describe_df.round(decimals=self.RESULT_DECIMALS)
        describe_df.set_index(self.STAT_SERIES_NAME, inplace=True)

        all_described_series = [
            series_name
            for series_name in self.df.all_series if series_name in describe_df.all_series
        ]
        return describe_df[all_described_series]  # type: ignore

    def _calculate_stat(
        self,
        stat: SupportedStats,
        stat_position: int,
    ) -> Optional[DataFrame]:
        """
        Returns an aggregated dataframe based on the stat to be calculated.
        :param series_to_aggregate: List of series names that stat supports
        :param stat: aggregation to be calculated
        :param stat_position: position of the stat in the final result
        """
        # filter series that can perform the aggregation
        series_to_aggregate = [
            s for s in self._get_series_to_aggregate() if hasattr(self.df.all_series[s], stat.value)
        ]
        if not series_to_aggregate:
            return None

        stat_df = self.df[series_to_aggregate]
        assert isinstance(stat_df, DataFrame)
        stat_df.reset_index(drop=True, inplace=True)

        original_series_names = stat_df.data_columns
        stat_df = stat_df.agg(func=stat.value).materialize()

        # original column names should remain
        stat_df.rename(
            columns=dict(zip(stat_df.data_columns, original_series_names)),
            inplace=True,
        )
        stat_df[self.STAT_SERIES_NAME] = stat.value
        stat_df[f'{self.STAT_SERIES_NAME}_position'] = stat_position
        return stat_df

    def _calculate_percentiles(self) -> Optional[DataFrame]:
        """
        Returns dataframe containing percentiles per each numerical series.
        """
        # filter series that can perform the aggregation 'quantile' operation
        series_to_aggregate = [
            s for s in self._get_series_to_aggregate() if hasattr(self.df.all_series[s], 'quantile')
        ]
        if not series_to_aggregate:
            return None

        percentile_df: DataFrame = self.df[series_to_aggregate]  # type: ignore
        percentile_df.reset_index(drop=True, inplace=True)

        percentile_df = percentile_df.quantile(q=list(self.percentiles))
        has_q_index = 'q' in percentile_df.all_series

        columns_rename = dict(zip(percentile_df.data_columns, series_to_aggregate))
        percentile_df.reset_index(drop=not has_q_index, inplace=True)

        if not has_q_index:
            percentile_df['q'] = self.percentiles[0]

        # original column names should remain
        columns_rename['q'] = self.STAT_SERIES_NAME
        percentile_df.rename(columns=columns_rename, inplace=True)
        current_position = len(SupportedStats)

        # SeriesFloat64 + int is not supported, need an expression
        percentile_df[f'{self.STAT_SERIES_NAME}_position'] = (
            percentile_df[self.STAT_SERIES_NAME].copy_override(
                expression=Expression.construct(
                    f'{current_position} + {{}}', percentile_df.all_series[self.STAT_SERIES_NAME],
                ),
            )
        )
        return percentile_df

    def _get_series_to_aggregate(self) -> List[str]:
        """
        returns a mapping between series types and series names in the dataframe to be described
        if describe has no include and exclude, numeric columns are considered only by default
        """
        dtypes_x_series = defaultdict(list)
        for series in self.df.data.values():
            series_type = type(series)
            parent_dtype = [
                s_type for s_type in _SUPPORTED_SERIES_TYPES if issubclass(series_type, s_type)
            ]
            if not parent_dtype:
                continue

            if (
                self.include and not isinstance(series, self.include)
                or self.exclude and isinstance(series, self.exclude)
            ):
                continue

            dtypes_x_series[parent_dtype[0]].append(series.name)

        if not dtypes_x_series:
            raise ValueError('DataFrame or Series has no supported dtype to describe.')

        if not self.include and not self.exclude and dtypes_x_series[SeriesAbstractNumeric]:
            return dtypes_x_series[SeriesAbstractNumeric]

        return list(itertools.chain.from_iterable(dtypes_x_series.values()))
