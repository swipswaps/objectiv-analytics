from typing import cast

from bach import SeriesAbstractNumeric, SeriesFloat64, Series, DataFrame, SeriesInt64
from bach.expression import Expression


class CutOperation:
    """
    In order to implement this class you should provide the following params:
    series: a numerical series to be segmented into bins
    bins: number of equal-width bins the series will be divided into.
    right: indicates if bin ranges should include the rightmost edge (lower bound).
    include_empty_bins: if true, it will return bins that contain no values in series.

    returns a new Numerical Series

    Example:
        CutOperation(series=s1, bins=3)()
    """
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
        """
        Merges self.series with its correspondent bucket range.

        returns a series containing each bin range/interval per value,
        if self.include_empty_bins is True, ranges without values will be considered.
        (initial series will be contained as index)
        """
        bucket_properties_df = self._calculate_bucket_properties()
        range_series = self._calculate_bucket_ranges(bucket_properties_df)

        df = self.series.to_frame()
        df.reset_index(drop=True, inplace=True)
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
        if self.include_empty_bins:
            # if we merge with df as left, range values will be null since left dataframe has priority
            df = range_series.to_frame().merge(df, how='left')

        else:
            df = df.merge(range_series, how='inner')

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

        returns a DataFrame containing the following calculated columns:
        * {self.series.name}_min: the final minimum value of the series with applied adjustments
        * {self.series.name}_max: the final maximum value of the series with applied adjustments
        * bin_adjustment: the adjustment to be applied to the lower bound of the first range or
        the upper bound of the last range. This is based on self.right
        * step: The equal-length width of each bucket.

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

        final_properties = [min_name, max_name, 'bin_adjustment', 'step']
        return properties_df.copy_override(
            series={p: properties_df.all_series[p] for p in final_properties},
        )

    def _calculate_adjustments(
        self, to_adjust: 'Series', compare_with: 'Series'
    ) -> 'Series':
        """
        calculates adjustment when to_adjust == compare_with.
        If both are equal, calculations based on RANGE_ADJUSTMENT will be performed:
        * if to_adjust != 0: RANGE_ADJUSTMENT * abs(to_adjust) else RANGE_ADJUSTMENT

        returns a Series with the calculated adjustment
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

    def _calculate_bucket_ranges(self, bucket_properties_df: 'DataFrame') -> 'Series':
        """
        Calculates upper and lower bound for each bucket.
         * bucket (integer 1 to N)
         * lower_bound (float)
         * upper_bound (float)
         * range (object containing both lower_bound and upper_bound)

         return a series containing each range per bucket (bucket series is found as index)
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
        range_df.materialize(node_name='bin_ranges', inplace=True)

        return range_df.all_series[self.RANGE_SERIES_NAME]
