"""
Copyright 2022 Objectiv B.V.
"""
from matplotlib.testing.decorators import check_figures_equal

from tests.functional.bach.test_data_and_utils import get_df_with_test_data


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


@check_figures_equal(extensions=['png', 'pdf'])
def test_plot_hist_bins(engine, fig_test, fig_ref) -> None:
    bt = get_df_with_test_data(engine, full_data_set=True)[['inhabitants']]
    pbt = bt.to_pandas()
    bins = 15

    ax_ref = fig_ref.add_subplot(111)
    ax_test = fig_test.add_subplot(111)
    pbt.plot.hist(bins=bins, ax=ax_ref)
    bt.plot.hist(bins=bins, ax=ax_test)
