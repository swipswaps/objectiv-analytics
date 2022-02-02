from typing import cast

from bach import SeriesAbstractNumeric, SeriesFloat64, Series, DataFrame
from bach.expression import Expression, AggregateFunctionExpression


class CutOperation:
    series: SeriesAbstractNumeric
    bins: int
    right: bool

    RANGE_ADJUSTMENT = 0.001
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

        properties_df = df.agg(['min', 'max']).materialize()
        min_name = f'{self.series.name}_min'
        max_name = f'{self.series.name}_max'

        properties_df['min_adjustment'] = self._calculate_adjustments(
            to_adjust=properties_df.all_series[min_name], compare_with=properties_df.all_series[max_name],
        )
        properties_df['max_adjustment'] = self._calculate_adjustments(
            to_adjust=properties_df.all_series[max_name], compare_with=properties_df.all_series[min_name],
        )
        properties_df = properties_df.materialize()

        properties_df[min_name] = (
            properties_df.all_series[min_name] - properties_df.all_series['min_adjustment']
        )
        properties_df[max_name] = (
            properties_df.all_series[max_name] + properties_df.all_series['max_adjustment']
        )

        diff_min_max = properties_df.all_series[max_name] - properties_df.all_series[min_name]
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
        range_df = buckets.to_frame()
        range_df.reset_index(drop=True, inplace=True)
        range_df = range_df.groupby(by=['bucket'])

        range_df[self.RANGE_SERIES_NAME] = SeriesFloat64(
            name=self.RANGE_SERIES_NAME,
            base_node=range_df.base_node,
            engine=range_df.engine,
            expression=AggregateFunctionExpression.construct(
                f'numrange(min({{}}), max({{}}), {self.bounds})',
                self.series,
                self.series,
            ),
            index=range_df.index,
            group_by=range_df.group_by,
            sorted_ascending=None,
            index_sorting=[],
        )

        range_df.reset_index(drop=False, inplace=True)
        return self._apply_bound_adjustments(range_df)

    def _apply_bound_adjustments(self, bucket_range_df: 'DataFrame') -> 'DataFrame':
        """
        Based on the bucket properties, performs each adjustment to the required bound.
        if self.right is True, adjustments are done to the lower_bound of each range,
        otherwise the upper_bound is the one to be affected.
        """
        df = bucket_range_df.copy()
        bucket_properties_df = self._calculate_bucket_properties()

        df['lower_bound'] = df[self.RANGE_SERIES_NAME].copy_override(
            expression=Expression.construct(f'lower({{}})', df['range'])
        )
        df['upper_bound'] = df[self.RANGE_SERIES_NAME].copy_override(
            expression=Expression.construct(f'upper({{}})', df['range'])
        )

        # current range bounds contain min and max values of the bucket
        # we require the actual inclusive and exclusive bounds
        step = Series.as_independent_subquery(bucket_properties_df['step'])
        df['lower_bound'] = (df['bucket'] - 1) * step
        df['upper_bound'] = df['bucket'] * step

        if self.right:
            case_stmt = f'case when bucket = 1 then {{}} - {{}} else {{}} end'
            bound_to_adjust = 'lower_bound'
        else:
            case_stmt = f'case when bucket = {self.bins} then {{}} + {{}} else {{}} end'
            bound_to_adjust = 'upper_bound'

        df[bound_to_adjust] = df[bound_to_adjust].copy_override(
            expression=Expression.construct(
                case_stmt,
                df[bound_to_adjust],
                Series.as_independent_subquery(bucket_properties_df['bin_adjustment']),
                df[bound_to_adjust],
            ),
        )

        df[self.RANGE_SERIES_NAME] = df[self.RANGE_SERIES_NAME].copy_override(
            expression=Expression.construct(
                f'numrange(cast({{}} as numeric), cast({{}} as numeric), {self.bounds})',
                df['lower_bound'],
                df['upper_bound'],
            ),
        )
        return df
