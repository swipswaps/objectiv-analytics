from abc import abstractmethod
from typing import Sequence, Optional, Generic, TypeVar

from bach import DataFrameOrSeries, DataFrame, Series, SeriesAbstractNumeric

TDataFrameOrSeries = TypeVar('TDataFrameOrSeries', bound='DataFrameOrSeries')


class ValueCountsOperation(Generic[TDataFrameOrSeries]):
    obj: TDataFrameOrSeries
    normalize: bool
    sort: bool
    ascending: bool
    dropna: bool

    VALUE_COUNT_SERIES_NAME = 'value_counts'

    def __init__(
        self,
        obj: TDataFrameOrSeries,
        normalize: bool = False,
        sort: bool = True,
        ascending: bool = False,
    ) -> None:
        self.obj = obj
        self.normalize = normalize
        self.sort = sort
        self.ascending = ascending

    def __call__(self, *args, **kwargs) -> Series:
        values_to_count_df = self._get_values_to_count()
        group_by = values_to_count_df.data_columns

        values_to_count_df[self.VALUE_COUNT_SERIES_NAME] = 1
        subset_df = values_to_count_df.groupby(group_by).sum()
        subset_df.materialize(inplace=True)

        value_count_series = subset_df.all_series[f'{self.VALUE_COUNT_SERIES_NAME}_sum'].copy_override(
            name=self.VALUE_COUNT_SERIES_NAME,
        )
        if self.sort:
            value_count_series = value_count_series.sort_values(ascending=self.ascending)

        if self.normalize:
            value_count_series /= value_count_series.sum()

        return value_count_series

    @abstractmethod
    def _get_values_to_count(self) -> DataFrame:
        """
        Expects a dataframe with the series to use when counting unique combinations
        """
        raise NotImplementedError


class DataFrameValueCountsOperation(ValueCountsOperation[DataFrame]):
    subset: Sequence[str]

    def __init__(
        self,
        obj: DataFrame,
        subset: Optional[Sequence[str]] = None,
        normalize: bool = False,
        sort: bool = True,
        ascending: bool = False,
    ) -> None:
        if not subset:
            self.subset = obj.data_columns if not obj.group_by else list(obj.group_by.index.keys())
        elif all(s in obj.data_columns for s in subset):
            self.subset = subset
        else:
            raise ValueError('subset contains invalid series.')

        super().__init__(obj=obj, normalize=normalize, sort=sort, ascending=ascending)

    def _get_values_to_count(self) -> DataFrame:
        """
        returns a new dataframe based on the series defined in self.subset
        if dataframe to be counted has a groupby, it will be materialized and grouby index will be used as
        subset
        """
        df = self.obj.copy()

        if df.group_by:
            df.materialize(inplace=True)
            df.reset_index(drop=False, inplace=True)

        subset_df = df[self.subset]
        assert isinstance(subset_df, DataFrame)
        return subset_df


class SeriesValueCountsOperation(ValueCountsOperation[Series]):
    bins: Optional[int]

    def __init__(
        self,
        obj: Series,
        bins: Optional[int] = None,
        normalize: bool = False,
        sort: bool = True,
        ascending: bool = False,
    ) -> None:
        if bins and not isinstance(obj, SeriesAbstractNumeric):
            raise ValueError('Cannot calculate bins for non numeric series.')
        self.bins = bins

        super().__init__(obj=obj, normalize=normalize, sort=sort, ascending=ascending)

    def _get_values_to_count(self) -> DataFrame:
        """
        series is transformed into a DataFrame.
        If bins are requested and series is numeric, the series will be segmented by bin ranges.
        """
        if not self.bins:
            return self.obj.to_frame()

        assert isinstance(self.obj, SeriesAbstractNumeric)
        return self.obj.cut(bins=self.bins).to_frame()
