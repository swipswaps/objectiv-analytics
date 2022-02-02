from bach import SeriesAbstractNumeric, SeriesFloat64


class CutOperation:
    series: SeriesAbstractNumeric
    bins: int

    def __init__(self, series: SeriesAbstractNumeric, bins: int) -> None:
        self.series = series
        self.bins = bins

    def __call__(self) -> SeriesFloat64:
        df = self.series.to_frame()