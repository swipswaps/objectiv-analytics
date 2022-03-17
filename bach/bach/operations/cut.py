"""
Copyright 2022 Objectiv B.V.
"""

from typing import cast, List, Union
from bach import SeriesAbstractNumeric, SeriesFloat64, Series, DataFrame, SeriesInt64
from bach.expression import Expression
import numpy


_RANGE_ADJUSTMENT = 0.001  # Pandas.cut currently uses 1%


class CutOperation:
    """
    In order to instantiate this class you should provide the following params:
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

        df = self.series.to_frame().reset_index(drop=True)
        df[self.RANGE_SERIES_NAME] = df[self.series.name].copy_override(
            expression=Expression.construct(
                (
                    f'case when cast({{}} as numeric) <@ {self.RANGE_SERIES_NAME} \n'
                    f'then {self.RANGE_SERIES_NAME} else null end'
                ),
                df[self.series.name],
            ),
            name=self.RANGE_SERIES_NAME,
        )
        if self.include_empty_bins:
            # if we merge with df as left, range values will be null since left dataframe has priority
            df = range_series.to_frame().merge(df, how='left')

        else:
            df = df.merge(range_series, how='inner')

        df = df.set_index(keys=self.series.name)
        return cast(SeriesFloat64, df[self.RANGE_SERIES_NAME])

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
        df = self.series.to_frame().reset_index(drop=True)

        properties_df = df.agg(['min', 'max'])
        min_name = f'{self.series.name}_min'
        max_name = f'{self.series.name}_max'

        properties_df['min_adjustment'] = self._calculate_adjustments(
            to_adjust=properties_df[min_name], compare_with=properties_df[max_name],
        )
        properties_df['max_adjustment'] = self._calculate_adjustments(
            to_adjust=properties_df[max_name], compare_with=properties_df[min_name],
        )

        # need to adjust both min and max with the prior calculated adjustment
        # this is mainly to avoid the case both min and max are equal
        properties_df[min_name] = properties_df[min_name] - properties_df['min_adjustment']
        properties_df[max_name] = properties_df[max_name] + properties_df['max_adjustment']

        diff_min_max = properties_df[max_name] - properties_df[min_name]
        # value used for expanding start/end bound
        properties_df['bin_adjustment'] = diff_min_max * _RANGE_ADJUSTMENT
        properties_df['step'] = diff_min_max / self.bins

        final_properties = [min_name, max_name, 'bin_adjustment', 'step']
        return properties_df[final_properties]

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
            f'case when {{}} != 0 then {_RANGE_ADJUSTMENT} * abs({{}}) else {_RANGE_ADJUSTMENT} end\n'
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
        min_series = Series.as_independent_subquery(bucket_properties_df.data[f'{self.series.name}_min'])
        step_series = Series.as_independent_subquery(bucket_properties_df.data[f'step'])

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
        range_df = buckets.to_frame().reset_index(drop=True).drop_duplicates(ignore_index=True)

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
                range_df[bound_to_adjust],
                Series.as_independent_subquery(bucket_properties_df['bin_adjustment']),
                range_df[bound_to_adjust],
            ),
        )

        range_df[self.RANGE_SERIES_NAME] = range_df.bucket.copy_override(
            expression=Expression.construct(
                # casting is needed since numrange does not support float64
                f'numrange(cast({{}} as numeric), cast({{}} as numeric), {self.bounds})',
                range_df['lower_bound'],
                range_df['upper_bound'],
            ),
        )
        range_df = range_df.materialize(node_name='bin_ranges')
        return range_df[self.RANGE_SERIES_NAME]


class QCutOperation:
    """
    In order to instantiate this class you should provide the following params:
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
        """
        df = self.series.to_frame().reset_index(drop=True)

        if len(self.quantiles) == 1:
            # need at least 2 quantiles for a range
            df[self.RANGE_SERIES_NAME] = None
        else:
            quantile_ranges = self._get_quantile_ranges()
            # currently is not possible to reference a column from another DataFrame
            # and use the expression in the merge subquery
            range_stmt = (
                f'case when cast({{}} as numeric) <@ {self.RANGE_SERIES_NAME}\n'
                f'then {self.RANGE_SERIES_NAME} end'
            )
            df[self.RANGE_SERIES_NAME] = df[self.series.name].copy_override(
                expression=Expression.construct(range_stmt, df[self.series.name]),
                name=self.RANGE_SERIES_NAME,
            )

            df = df.merge(quantile_ranges, how='left', on=self.RANGE_SERIES_NAME)

        new_index = {self.series.name: df[self.series.name]}
        return cast(SeriesFloat64, df[self.RANGE_SERIES_NAME].copy_override(index=new_index))

    def _get_quantile_ranges(self) -> 'Series':
        """
        Calculates the corresponding ranges per each quantile bucket.

        The following series are calculated:
        * lower_bound: for calculating the lower bound of each range it is required to calculate
            all requested quantiles from the series. The lowest bound is adjusted since it might be
            included in the dataset.
        * upper_bound: is the lower bound from the next range that follows the current one.
            If current lower bound is the result of the largest quantile, the upper bound will be null.
        * range: interval containing the calculated upper and lower bounds per bucket.
            If the upper bound is null, the range will be null.

        Returns a series containing the range of each bucket

        .. note::
            The adjustment performed on the lowest bound is done only to resemble Panda's implementation.
            Current implementation might generate wrong ranges in very extreme edge cases,
            such as when _RANGE_ADJUSTMENT is considerably larger than the first quantile result.
            Therefore, be aware of this scenario.
            Current implementation might go into a discussion in the future.
        """
        q_result = self.series.quantile(q=self.quantiles).copy_override(name='q_result')
        min_q_result = q_result.min()

        quantile_ranges_df = q_result.to_frame()

        # some quantiles might have the same result, we need to avoid having overlapped ranges
        quantile_ranges_df = quantile_ranges_df.drop_duplicates(ignore_index=True)

        # lowest calculated quantile might be also be in the dataset, therefore
        # we need to extend the lowest bound
        # Be aware that this adjustment might generate errors when
        # 0 < lowest_quantile < RANGE_ADJUSTMENT
        quantile_ranges_df['lower_bound'] = quantile_ranges_df['q_result'].copy_override(
            expression=Expression.construct(
                f'case when {{}} = {{}} then {{}} - {_RANGE_ADJUSTMENT} else {{}} end',
                Series.as_independent_subquery(min_q_result),
                *[quantile_ranges_df['q_result']] * 3
            )
        )

        # should call "series.lag" instead but just need sorting in the window function
        quantile_ranges_df['upper_bound'] = quantile_ranges_df['lower_bound'].copy_override(
            expression=Expression.construct(
                f'lag({{}}, 1, NULL) over (order by {{}} desc)',
                quantile_ranges_df['lower_bound'],
                quantile_ranges_df['lower_bound'],
            ),
            name='upper_bound'
        )

        # must not include lower bound, since a calculated quantile might also be in the dataset
        # so the value can generate duplicates
        bound = "'(]'"
        range_stmt = (
            f'case when {{}} is not null\n'
            f'then numrange(cast({{}} as numeric), cast({{}} as numeric), {bound}) end'
        )
        lower_bound = quantile_ranges_df['lower_bound']
        upper_bound = quantile_ranges_df['upper_bound']

        quantile_ranges_df[self.RANGE_SERIES_NAME] = lower_bound.copy_override(
            expression=Expression.construct(range_stmt, upper_bound, lower_bound, upper_bound),
        )
        # The expressions of lower_bound and upper_bound are complex and long. Below they are used three
        # times in the expression for the range column. By materializing the dataframe first, we prevent the
        # generated sql from containing duplicated code. Additionally, the generated sql becomes more
        # readable too.
        quantile_ranges_df = quantile_ranges_df.materialize()
        return quantile_ranges_df[self.RANGE_SERIES_NAME]
