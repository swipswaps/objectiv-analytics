"""
Copyright 2022 Objectiv B.V.
"""
from typing import TYPE_CHECKING, Optional, Union, List

import numpy
import pandas

if TYPE_CHECKING:
    from bach.dataframe import DataFrame


class PlotHandler(object):
    """
    Preprocesses data needed for plotting and uses Pandas ``DataFrame.plot``.
    """
    df: 'DataFrame'

    def __init__(self, df: 'DataFrame') -> None:
        self.df = df

    def hist(
        self,
        by: Optional[Union[str, List[str]]] = None,
        bins: int = 10,
        **kwargs,
    ):
        """
        Draw a histogram representation of DataFrame's numeric columns.

        :param by: series to group data by. Currently, not supported
        :param bins: number of equal-width histogram bins.
        :param kwargs: additional keyword arguments supported by Pandas ``DataFrame.plot``

        :returns: a histogram plot (matplotlib.AxesSubplot)
        """

        if by:
            raise NotImplementedError('by is currently not supported.')

        from bach.series.series_numeric import SeriesAbstractNumeric
        numeric_columns = [s.name for s in self.df.data.values() if isinstance(s, SeriesAbstractNumeric)]

        if not numeric_columns:
            raise ValueError(
                "hist method requires numerical columns, nothing to plot."
            )

        from bach.operations.cut import CutOperation

        df = self.df.copy()
        df = df[numeric_columns]

        # stack the df in order to have all numeric values in a single series
        label_values_series = df.reset_index(drop=True).stack()
        bins_per_col_df = CutOperation(
            label_values_series,
            bins=bins,
            method='bach',
            include_empty_bins=True,
            ignore_index=False,
        )().to_frame()

        # create frequency distribution dataframe per label (numeric column)
        # labels are contained in __stacked_index series (result from DataFrame.stack)
        freq_df = bins_per_col_df.groupby(by=['__stacked_index', 'range']).count()

        # prepare results for Pandas hist compatibility
        freq_pdf = freq_df.to_pandas()
        freq_pdf = freq_pdf.unstack(level='__stacked_index', fill_value=0)
        freq_pdf.columns = freq_pdf.columns.droplevel()
        freq_pdf = freq_pdf.reset_index(drop=False)

        # get lower bounds per range and add the last upper bound (last_bin + bin_width)
        freq_pdf['bin_edge'] = freq_pdf['range'].apply(lambda r: r.lower).astype(float)
        bin_edges = freq_pdf['bin_edge'].to_numpy()
        bin_width = numpy.ediff1d(bin_edges)[-1]
        bin_edges = numpy.append(bin_edges, bin_edges[-1] + bin_width)

        # use calculated frequencies as weights, since Pandas will try to recalculate frequencies
        hist_data = pandas.DataFrame(data={col: freq_pdf['bin_edge'] for col in df.data_columns})
        weights = freq_pdf[numeric_columns].to_numpy()
        return hist_data.plot.hist(bins=bin_edges, weights=weights, **kwargs)
