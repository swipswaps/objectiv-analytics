from typing import cast, List, Union

from bach import SeriesAbstractNumeric, SeriesFloat64, Series, DataFrame, SeriesInt64
from bach.expression import Expression
import numpy


class CutOperation:
    series: SeriesAbstractNumeric
    bins: int
    right: bool
    include_empty_bins: bool

    RANGE_ADJUSTMENT = 0.001  # Pandas.cut currently uses 1%
    RANGE_SERIES_NAME = 'range'

    def __init__(
        self,
        series: SeriesAbstractNumeric,
        bins: int,
        right: bool = True,
        include_empty_bins: bool = False,
    ) -> None:
        self.series = series
        self.bins = bins
        self.right = right
        self.include_empty_bins = include_empty_bins

    def __call__(self) -> SeriesFloat64:
        bucket_properties_df = self._calculate_bucket_properties()
        range_df = self._calculate_bucket_ranges(bucket_properties_df)

        df = self.series.to_frame()
        df.reset_index(drop=True, inplace=True)
        df['bucket'] = self._calculate_buckets(bucket_properties_df)

        df = df.merge(
            range_df,
            on='bucket',
            how='inner' if not self.include_empty_bins else 'right',
        )
        df.set_index(keys=self.series.name, inplace=True)
        return cast(SeriesFloat64, df.all_series[self.RANGE_SERIES_NAME])

    @property
    def bounds(self) -> str:
        return "'(]'" if self.right else "'[)'"

    def _calculate_bucket_properties(self) -> 'DataFrame':
        """
        Calculates the following properties that are required
        for the bucket calculations and range adjustments:
        * min: Lower boundary for width_bucket. Based on series.min - min_adjustment

        * max: Upper boundary for width_bucket. Based on series.max - max_adjustment:

        * min_adjustment: the value to be subtracted to series.min
            if series.min == series.max,
            minimum value is decreased by RANGE_ADJUSTMENT * abs(series.min) if series.min > 0, otherwise just
            by the RANGE_ADJUSTMENT

        * max_adjustment: the value to be added to series.max
            if series.min == series.max,
            maximum value is increased by RANGE_ADJUSTMENT * abs(series.max) if series.max > 0, otherwise just
            by the RANGE_ADJUSTMENT

        * bin_adjustment: value used to adjust lower/upper bounds of the final bucket ranges.
           Based on (max - min) * RANGE_ADJUSTMENT

        * step: the size of each bucket range
        ** Adjustments are needed in order to have similar bin intervals as in Pandas
        """
        df = self.series.to_frame()
        df.reset_index(drop=True, inplace=True)

        properties_df = df.agg(['min', 'max'])
        min_name = f'{self.series.name}_min'
        max_name = f'{self.series.name}_max'

        properties_df['min_adjustment'] = self._calculate_adjustments(
            to_adjust=properties_df.all_series[min_name], compare_with=properties_df.all_series[max_name],
        )
        properties_df['max_adjustment'] = self._calculate_adjustments(
            to_adjust=properties_df.all_series[max_name], compare_with=properties_df.all_series[min_name],
        )

        # need to adjust both min and max with the prior calculated adjustment
        # this is mainly to avoid the case both min and max are equal
        properties_df[min_name] = (
            properties_df.all_series[min_name] - properties_df.all_series['min_adjustment']
        )
        properties_df[max_name] = (
            properties_df.all_series[max_name] + properties_df.all_series['max_adjustment']
        )

        diff_min_max = properties_df.all_series[max_name] - properties_df.all_series[min_name]
        # value used for expanding start/end bound
        properties_df['bin_adjustment'] = diff_min_max * self.RANGE_ADJUSTMENT
        properties_df['step'] = diff_min_max / self.bins

        return properties_df

    def _calculate_buckets(self, bucket_properties_df: 'DataFrame') -> 'Series':
        """
        calculates each bucket for all series values.
        """
        return self.series.copy_override(
            name='bucket',
            expression=Expression.construct(
                # we need to make sure max value is on the last bucket
                (
                    f'case when {{}} = {{}} then {self.bins} else \n'
                    f'width_bucket({{}}, {{}}, {{}}, {self.bins}) end'
                ),
                self.series,
                Series.as_independent_subquery(bucket_properties_df[f'{self.series.name}_max']),
                self.series,
                Series.as_independent_subquery(bucket_properties_df[f'{self.series.name}_min']),
                Series.as_independent_subquery(bucket_properties_df[f'{self.series.name}_max']),
            ),
        )

    def _calculate_adjustments(
        self, to_adjust: 'Series', compare_with: 'Series'
    ) -> 'Series':
        """
        calculates adjustment when to_adjust == compare_with.
        If both are equal, calculations based on RANGE_ADJUSTMENT will be performed
        """
        case_stmt = (
            f'case when {{}} = {{}} then\n'
            f'case when {{}} != 0 then {self.RANGE_ADJUSTMENT} * abs({{}}) else {self.RANGE_ADJUSTMENT} end\n'
            f'else 0 end'
        )
        return to_adjust.copy_override(
            expression=Expression.construct(
                case_stmt,
                compare_with,
                *[to_adjust] * 3,
            )
        )

    def _calculate_bucket_ranges(self, bucket_properties_df: 'DataFrame') -> 'DataFrame':
        """
        Calculates upper and lower bound for each bucket.
        """
        min_series = Series.as_independent_subquery(bucket_properties_df[f'{self.series.name}_min'])
        step_series = Series.as_independent_subquery(bucket_properties_df[f'step'])

        # self.series might not have data for all buckets, we need to actually generate the series
        buckets = SeriesInt64(
            engine=self.series.engine,
            base_node=self.series.base_node,
            expression=Expression.construct(f'generate_series(1, {self.bins})'),
            name='bucket',
            index={},
            group_by=None,
            sorted_ascending=None,
            index_sorting=[],
        )
        range_df = buckets.to_frame()
        range_df.reset_index(drop=True, inplace=True)
        range_df.drop_duplicates(ignore_index=True, inplace=True)

        # lower_bound = (bucket - 1) *  step + min
        range_df['lower_bound'] = (range_df.bucket - 1) * step_series + min_series

        # upper_bound = bucket * step + min
        range_df['upper_bound'] = range_df.bucket * step_series + min_series

        if self.right:
            case_stmt = f'case when bucket = 1 then {{}} - {{}} else {{}} end'
            bound_to_adjust = 'lower_bound'
        else:
            case_stmt = f'case when bucket = {self.bins} then {{}} + {{}} else {{}} end'
            bound_to_adjust = 'upper_bound'

        # expand the correspondent boundary
        range_df[bound_to_adjust] = range_df[bound_to_adjust].copy_override(
            expression=Expression.construct(
                case_stmt,
                range_df.all_series[bound_to_adjust],
                Series.as_independent_subquery(bucket_properties_df['bin_adjustment']),
                range_df.all_series[bound_to_adjust],
            ),
        )

        range_df[self.RANGE_SERIES_NAME] = range_df.bucket.copy_override(
            expression=Expression.construct(
                # casting is needed since numrange does not support float64
                f'numrange(cast({{}} as numeric), cast({{}} as numeric), {self.bounds})',
                range_df.all_series['lower_bound'],
                range_df.all_series['upper_bound'],
            ),
        )
        return range_df


class QCutOperation:
    """
    In order to implement this class you should provide the following params:
    series: A numerical series
    q: The number of quantiles or list of quantiles to be calculated

    returns a new Series containing the quantile ranges per each value on the series.

    Example:
        QCutOperation(s1, q=4)()   # will calculated quantiles `0, 0.25, 0.5, 0.75, 1`
        or
        QCutOperation(s1, q=[0.25, 0.5, 0.75])()
    """

    series: SeriesAbstractNumeric
    quantiles: List[float]

    RANGE_SERIES_NAME = 'q_range'

    def __init__(self, series: SeriesAbstractNumeric, q: Union[int, List[float]]) -> None:
        self.series = series
        self.quantiles = q if isinstance(q, list) else numpy.linspace(0, 1, q + 1).tolist()

    def __call__(self, *args, **kwargs) -> SeriesFloat64:
        """
        Gets the quantile range per bucket and assigns the correct range to each value. If the value
        is not contained in any range, then it will be null.
        on it, a
        """
        quantile_ranges_df = self._get_quantile_ranges()
        df = self.series.to_frame()
        df.reset_index(drop=True, inplace=True)

        # currently is not possible to reference a column from another DataFrame
        # and use the expression in the merge subquery
        df[self.RANGE_SERIES_NAME] = df.all_series[self.series.name].copy_override(
            expression=Expression.construct(
                (
                    f'case when cast({{}} as numeric) <@ {self.RANGE_SERIES_NAME} \n'
                    f'then {self.RANGE_SERIES_NAME} end'
                ),
                df.all_series[self.series.name],
            ),
            name=self.RANGE_SERIES_NAME,
        )

        df = df.merge(quantile_ranges_df, how='left', on=self.RANGE_SERIES_NAME)

        result = df.all_series[self.RANGE_SERIES_NAME].copy_override(
            index={self.series.name: df.all_series[self.series.name]},
        )
        return cast(SeriesFloat64, result)

    def _get_quantile_ranges(self) -> 'Series':
        """
        Calculates the corresponding ranges per each quantile bucket.

        The following series are calculated:
        * lower_bound: for calculating the lower bound of each range it is required to calculate
        all requested quantiles from the series.
        * upper_bound: is the lower bound from the next range that follows the current one.
         If current lower bound is the result of the largest quantile, the upper bound will be null.
        * range: interval containing the calculated upper and lower bounds per bucket.
        If the upper bound is null, the range will be null.

        Returns a series containing the range of each bucket
        """
        lower_bound = self.series.quantile(q=self.quantiles).copy_override(name='lower_bound')

        quantile_ranges_df = lower_bound.to_frame()
        quantile_ranges_df.reset_index(drop=True, inplace=True)

        # should call "series.lag" instead but just need sorting in the window function
        quantile_ranges_df['upper_bound'] = lower_bound.copy_override(
            expression=Expression.construct(
                f'lag({{}}, 1, NULL) over (order by {{}} desc)',
                quantile_ranges_df.all_series['lower_bound'],
                quantile_ranges_df.all_series['lower_bound'],
            ),
            name='lower_bound'
        )

        quantile_ranges_df[self.RANGE_SERIES_NAME] = lower_bound.copy_override(
            expression=Expression.construct(
                f'case when {{}} is not null then numrange(cast({{}} as numeric), cast({{}} as numeric)) end',
                quantile_ranges_df.all_series['upper_bound'],
                quantile_ranges_df.all_series['lower_bound'],
                quantile_ranges_df.all_series['upper_bound'],
            ),
        )

        quantile_ranges_df.materialize(inplace=True)
        return quantile_ranges_df.all_series[self.RANGE_SERIES_NAME]
