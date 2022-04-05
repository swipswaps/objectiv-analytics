from typing import TYPE_CHECKING, Optional, Union, Sequence, Tuple

import numpy as np
import pandas
from pandas.plotting._matplotlib import tools as pandas_matplotlib_tools

if TYPE_CHECKING:
    from bach.dataframe import DataFrame

class PlotHandler(object):
    df: 'DataFrame'

    def __init__(self, df: 'DataFrame') -> None:
        self.df = df

    def hist(
        self,
        column: Optional[Union[str, Sequence[str]]] = None,
        by: Optional[str] = None,
        bins: int = 10,
        **kwargs,
    ):
        from bach import SeriesAbstractNumeric

        if by:
            raise NotImplementedError('by is currently not supported.')
        if column:
            numeric_columns = column if isinstance(column, list) else [column]
            for col in numeric_columns:
                if not isinstance(self.df[col], SeriesAbstractNumeric):
                    raise ValueError(f'{col} is not a valid numeric series.')
        else:
            numeric_columns = [s.name for s in self.df.data.values() if isinstance(s, SeriesAbstractNumeric)]

        if not numeric_columns:
            raise ValueError(
                "hist method requires numerical or datetime columns, nothing to plot."
            )

        from bach.operations.cut import CutOperation

        df = self.df.copy()
        df = df[numeric_columns]

        label_values_series = df.reset_index(drop=True).stack()
        bins_per_col_df = CutOperation(
            label_values_series,
            bins=bins,
            method='bach',
            include_empty_bins=True,
            ignore_index=False,
        )().to_frame()

        # create frequency distribution dataframe per label (numeric column)
        freq_df = bins_per_col_df.groupby(by=['label', 'range']).count()
        freq_pdf = freq_df.to_pandas()
        freq_pdf = freq_pdf.unstack(level='label', fill_value=0)
        freq_pdf.columns = freq_pdf.columns.droplevel()
        freq_pdf = freq_pdf.reset_index(drop=False)
        freq_pdf['bin_edge'] = freq_pdf['range'].apply(lambda r: r.lower).astype(float)

        bin_edges = freq_pdf['bin_edge'].to_numpy()
        bin_width = np.ediff1d(bin_edges)[-1]
        bin_edges = np.append(bin_edges, bin_edges[-1] + bin_width)

        x = pandas.DataFrame(data={col: freq_pdf['bin_edge'] for col in df.data_columns})
        weights = freq_pdf[numeric_columns].to_numpy()
        return x.plot.hist(bins=bin_edges, weights=weights, **kwargs)
