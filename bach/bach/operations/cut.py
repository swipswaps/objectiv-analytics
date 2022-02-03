from typing import cast

from bach import SeriesAbstractNumeric, SeriesFloat64, Series, DataFrame
from bach.expression import Expression


class CutOperation:
    series: SeriesAbstractNumeric
    bins: int
    right: bool

    RANGE_ADJUSTMENT = 0.001  # Pandas.cut currently uses 1%
    RANGE_SERIES_NAME = 'range'

    def __init__(self, series: SeriesAbstractNumeric, bins: int, right: bool = True) -> None:
        self.series = series
        self.bins = bins
        self.right = right

    def __call__(self) -> SeriesFloat64:
        range_df = self._calculate_bucket_ranges()

        df = self.series.to_frame()
        df.reset_index(drop=True, inplace=True)
        df['bucket'] = self._calculate_buckets()

        df = df.merge(range_df, on='bucket')
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

    def _calculate_buckets(self) -> 'Series':
        """
        calculates each bucket for all series values.
        """
        bucket_properties_df = self._calculate_bucket_properties()
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

    def _calculate_bucket_ranges(self) -> 'DataFrame':
        """
        Calculates upper and lower bound for each bucket.
        """
        buckets = self._calculate_buckets()
        bucket_properties_df = self._calculate_bucket_properties()

        min_series = Series.as_independent_subquery(bucket_properties_df[f'{self.series.name}_min'])
        step_series = Series.as_independent_subquery(bucket_properties_df[f'step'])

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
