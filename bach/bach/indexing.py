from functools import reduce
from typing import Union, List, Optional, Tuple, TYPE_CHECKING

IndexLabel = Union[str, int, 'SeriesBoolean', List[str], List[int]]
LocKey = Union[IndexLabel, Tuple[Union[IndexLabel, slice], Union[str, int, slice]]]
if TYPE_CHECKING:
    from bach.dataframe import DataFrameOrSeries, DataFrame, Scalar


class LocIndexer(object):
    obj: 'DataFrame'

    def __init__(self, obj: 'DataFrame'):
        self.obj = obj

    def __getitem__(cls, key: LocKey) -> 'DataFrameOrSeries':
        if isinstance(key, tuple):
            index_labels, column_labels = key
        else:
            index_labels = key
            column_labels = None

        if isinstance(index_labels, slice):
            filtered_index_df = cls._get_item_by_slicing(index_labels.start, index_labels.stop)
        else:
            filtered_index_df = cls._get_item_by_labels(index_labels)

        if column_labels:
            filtered_index_df = filtered_index_df[cls._parse_column_labels(column_labels)]

        # if index_accessor is a single label, it returns a series
        if isinstance(index_labels, (str, int)):
            return filtered_index_df.reset_index(drop=True).stack()

        return filtered_index_df

    def __setitem__(self, key: LocKey, value: 'Scalar') -> None:
        ...

    def _parse_column_labels(self, labels: Union[slice, str, List[str]]) -> List[str]:
        if isinstance(labels, list):
            return labels
        if isinstance(labels, str):
            return [labels]

        if labels.start is None and labels.stop is None:
            return self.obj.data_columns

        index_start = None
        index_stop = None
        if labels.start is not None:
            if labels.start not in self.obj.data_columns:
                raise ValueError(f'{labels.start} does not exists in DataFrame')
            else:
                index_start = self.obj.data_columns.index(labels.start)

        if labels.stop is not None:
            if labels.stop not in self.obj.data_columns:
                raise ValueError(f'{labels.stop} does not exists in DataFrame')
            else:
                index_stop = self.obj.data_columns.index(labels.stop) + 1

        if index_start is not None and index_stop is not None:
            return self.obj.data_columns[index_start:index_stop]

        if index_start is not None:
            return self.obj.data_columns[index_start:]
        return self.obj.data_columns[:index_stop]

    def _get_item_by_labels(self, labels: IndexLabel) -> 'DataFrame':
        if not self.obj:
            raise ValueError('Cannot access rows by label if DataFrame/Series has no index.')

        level_0_index = self.obj.index_columns[0]

        if isinstance(labels, (str, int)):
            mask = self.obj.index[level_0_index] == labels
        elif isinstance(labels, list):
            loc_conditions = [self.obj.index[level_0_index] == l for l in labels]
            mask = reduce(lambda cond1, cond2: cond1 | cond2, loc_conditions)
        else:
            mask = labels

        return self.obj[mask]

    def _get_item_by_slicing(
        self,
        start: Optional[Union[str, int]],
        stop: Optional[Union[str, int]],
    ) -> 'DataFrame':
        start_stop_labels = [lbl for lbl in [start, stop] if lbl is not None]
        if not start_stop_labels:
            return self.obj.copy()

        if not self.obj.index and (start or stop):
            raise ValueError('Cannot slice rows if DataFrame/Series has no index.')

        if not self.obj.order_by:
            raise ValueError('Can only apply index slicing if DataFrame/Series is sorted.')

        from bach.partitioning import Window, WindowFrameMode

        level_0_index = self.obj.index_columns[0]

        numbered_df = self.obj.copy()
        numbered_df['position'] = numbered_df.all_series[level_0_index].window_row_number(
            window=Window([], mode=WindowFrameMode.ROWS, order_by=self.obj.order_by),
        )

        numbered_df = numbered_df.materialize('numbered_index')
        # need this constant since we cannot compare 2 dataframes without indexes
        numbered_df['constant_index'] = 1

        start_stop_df = numbered_df[['constant_index', 'position']]
        start_stop_df = (
            start_stop_df.loc[start_stop_labels]
            .groupby(by='constant_index')
            .agg({'position': ['min', 'max']})
        )
        start_stop_df = start_stop_df.materialize('loc_start_stop')
        numbered_df = numbered_df.reset_index(drop=False).set_index('constant_index')

        mask = []
        if start:
            mask.append(numbered_df['position'] >= start_stop_df['position_min'])

        if stop:
            mask.append(numbered_df['position'] <= start_stop_df['position_max'])

        sliced_df = numbered_df.merge(start_stop_df, how='inner', on=mask)
        sliced_df = sliced_df.set_index(self.obj.index_columns, drop=True)
        sliced_df = sliced_df[self.obj.data_columns]
        return sliced_df
