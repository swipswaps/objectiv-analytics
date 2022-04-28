"""
Copyright 2022 Objectiv B.V.
"""
from decimal import Decimal

from matplotlib.testing.decorators import check_figures_equal
from psycopg2._range import NumericRange

from tests.functional.bach.test_data_and_utils import get_df_with_test_data, assert_equals_data


# generates and compares 2 matplotlib figures (png, pdf)
# For more information https://matplotlib.org/3.5.0/api/testing_api.html#module-matplotlib.testing

@check_figures_equal(extensions=['png', 'pdf'])
def test_plot_hist_basic(engine, fig_test, fig_ref) -> None:
    bt = get_df_with_test_data(engine, full_data_set=False)
    pbt = bt.to_pandas()

    ax_ref = fig_ref.add_subplot(111)
    ax_test = fig_test.add_subplot(111)
    pbt.plot.hist(ax=ax_ref)
    bt.plot.hist(ax=ax_test)

    result_calc_bins = bt.plot._calculate_hist_frequencies(
        bins=10, numeric_columns=['skating_order', 'inhabitants', 'founding'],
    )

    assert_equals_data(
        result_calc_bins,
        expected_columns=['column_label',  'frequency', 'lower_edge'],
        order_by=['column_label', 'lower_edge'],
        expected_data=[
            ['empty_bins', 0, Decimal('9349.4')],
            ['empty_bins', 0, Decimal('18697.8')],
            ['empty_bins', 0, Decimal('37394.6')],
            ['empty_bins', 0, Decimal('46743')],
            ['empty_bins', 0, Decimal('56091.4')],
            ['empty_bins', 0, Decimal('65439.8')],
            ['empty_bins', 0, Decimal('74788.2')],
            ['founding',   3, Decimal('1')],
            ['inhabitants', 1, Decimal('1')],
            ['inhabitants', 1, Decimal('28046.2')],
            ['inhabitants', 1, Decimal('84136.6')],
            ['skating_order', 3, Decimal('1')],
        ],
        round_decimals=True,
    )


@check_figures_equal(extensions=['png', 'pdf'])
def test_plot_hist_bins(engine, fig_test, fig_ref) -> None:
    bt = get_df_with_test_data(engine, full_data_set=True)[['inhabitants']]
    pbt = bt.to_pandas()
    bins = 5

    ax_ref = fig_ref.add_subplot(111)
    ax_test = fig_test.add_subplot(111)
    pbt.plot.hist(bins=bins, ax=ax_ref)
    bt.plot.hist(bins=bins, ax=ax_test)

    result_calc_bins = bt.plot._calculate_hist_frequencies(
        bins=5, numeric_columns=['inhabitants'],
    )

    assert_equals_data(
        result_calc_bins,
        expected_columns=['column_label', 'frequency', 'lower_edge'],
        order_by=['column_label', 'lower_edge'],
        expected_data=[
            ['empty_bins', 0, Decimal('37814')],
            ['empty_bins', 0, Decimal('56371')],
            ['inhabitants', 9, Decimal('700')],
            ['inhabitants', 1, Decimal('19257')],
            ['inhabitants', 1, Decimal('74928')],
        ],
        round_decimals=True,
    )

