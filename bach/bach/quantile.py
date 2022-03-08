from typing import cast, Union, List

from bach.series import SeriesAbstractNumeric, SeriesTimedelta, Series, SeriesFloat64
from bach.expression import AggregateFunctionExpression
from bach.series.series import WrappedPartition
from bach.operations.concat import SeriesConcatOperation


def calculate_quantiles(
    series: Union[SeriesTimedelta, SeriesAbstractNumeric],
    partition: WrappedPartition = None,
    q: Union[float, List[float]] = 0.5,
) -> Series:
    """
    When q is a float or len(q) == 1, the resultant series index will remain
    In case multiple quantiles are calculated, the resultant series index will have all calculated
    quantiles as index values.
    """
    quantiles = [q] if isinstance(q, float) else q
    quantile_results = []
    for qt in quantiles:
        if qt < 0 or qt > 1:
            raise ValueError(f'value {qt} should be between 0 and 1.')

        agg_result = cast(
            'SeriesFloat64',
            series._derived_agg_func(
                partition=partition,
                expression=AggregateFunctionExpression.construct(
                    f'percentile_cont({qt}) within group (order by {{}})',
                    series,
                ),
            ),
        )
        if len(quantiles) == 1:
            return agg_result

        quantile_df = agg_result.to_frame()
        # maps the resultant quantile
        # a hack in order to avoid calling quantile_df.materialized().
        # Currently doing quantile['q'] = qt
        # will raise some errors since the expression is not an instance of AggregateFunctionExpression
        quantile_df['quantile'] = agg_result.copy_override(
            expression=AggregateFunctionExpression.construct(fmt=f'{qt}'),
        )
        quantile_df = quantile_df.set_index('quantile')
        quantile_results.append(quantile_df.all_series[series.name])

    return SeriesConcatOperation(
        objects=quantile_results,
        ignore_index=False,  # should keep q index since multiple quantiles were calculated
    )()
