from functools import reduce
from typing import Union, List, Optional, Tuple, TYPE_CHECKING, overload

if TYPE_CHECKING:
    from bach.dataframe import DataFrame
    from bach.series.series import Series, SeriesBoolean

IndexLabel = Union['SeriesBoolean', List[str], List[int]]
LocKey = Union[IndexLabel, Tuple[Union[IndexLabel, slice], Union[str, int, slice]]]


class BaseLocIndex(object):
    obj: 'DataFrame'

    def __init__(self, obj: 'DataFrame'):
        self.obj = obj

    def _get_data_columns_subset(self, labels: Union[slice, str, List[str]]) -> List[str]:
        if isinstance(labels, list):
            return labels
        if isinstance(labels, str):
            return [labels]

        return self._parse_column_slicing(labels)

    def _parse_column_slicing(self, label_slicing: slice) -> List[str]:
        data_columns = self.obj.data_columns
        if label_slicing.start is None and label_slicing.stop is None:
            return data_columns

        index_start = self._get_label_index(label_slicing.start) if label_slicing.start else None
        index_stop = self._get_label_index(label_slicing.stop) + 1 if label_slicing.stop else None

        if index_start is not None and index_stop is not None:
            return data_columns[index_start:index_stop]

        if index_start is not None:
            return data_columns[index_start:]

        return data_columns[:index_stop]

    def _get_label_index(self, label: str) -> int:
        if label not in self.obj.data_columns:
            raise ValueError(f'{label} does not exists in data columns')

        return self.obj.data_columns.index(label)

    def _get_index_label_mask(self, labels: Union[int, str, IndexLabel]) -> 'SeriesBoolean':
        if not self.obj:
            raise ValueError('Cannot access rows by label if DataFrame/Series has no index.')

        level_0_index = self.obj.index_columns[0]

        if isinstance(labels, (str, int)):
            return self.obj.index[level_0_index] == labels

        if isinstance(labels, list):
            loc_conditions = [self.obj.index[level_0_index] == label for label in labels]
            return reduce(lambda cond1, cond2: cond1 | cond2, loc_conditions)

        return labels

    def _get_sliced_subset(
        self,
        start: Optional[Union[str, int]],
        stop: Optional[Union[str, int]],
        how: str = 'inner',
    ) -> 'DataFrame':
        start_stop_labels = [lbl for lbl in [start, stop] if lbl is not None]
        if not start_stop_labels:
            return self.obj.copy()

        if not self.obj.index and (start or stop):
            raise ValueError('Cannot slice rows if DataFrame/Series has no index.')

        if not self.obj.order_by:
            raise ValueError('Can only apply index slicing if DataFrame/Series is sorted.')

        numbered_df = self.__get_numbered_df_by_index()

        # need this constant since we cannot merge 2 dataframes without indexes
        numbered_df['constant_index'] = 1
        start_stop_df = numbered_df[['constant_index', 'position']].loc[start_stop_labels]
        start_stop_df = start_stop_df.groupby(by='constant_index').agg({'position': ['min', 'max']})
        start_stop_df = start_stop_df.materialize('loc_start_stop')

        numbered_df = numbered_df.reset_index(drop=False).set_index('constant_index')
        mask = []
        if start:
            mask.append(numbered_df['position'] >= start_stop_df['position_min'])

        if stop:
            mask.append(numbered_df['position'] <= start_stop_df['position_max'])

        sliced_df = numbered_df.merge(start_stop_df, how=how, on=mask)
        sliced_df = sliced_df.set_index(list(self.obj.index_columns), drop=True)
        sliced_df = sliced_df[self.obj.data_columns]
        return sliced_df

    def __get_numbered_df_by_index(self) -> 'DataFrame':
        from bach.partitioning import Window, WindowFrameMode

        level_0_index = self.obj.index_columns[0]

        numbered_df = self.obj.copy()
        numbered_df['position'] = numbered_df.all_series[level_0_index].window_row_number(
            window=Window([], mode=WindowFrameMode.ROWS, order_by=self.obj.order_by),
        )

        return numbered_df.materialize('numbered_index')


class LocIndexer(BaseLocIndex):
    @overload
    def __getitem__(self, key: Union[str, int]) -> 'Series':
        ...

    @overload
    def __getitem__(self, key: LocKey) -> 'DataFrame':
        ...

    def __getitem__(self, key):
        if isinstance(key, tuple):
            index_labels, column_labels = key
        else:
            index_labels = key
            column_labels = None

        if isinstance(index_labels, slice):
            filtered_index_df = self._get_sliced_subset(index_labels.start, index_labels.stop, how='inner')
        else:
            filtered_index_df = self.obj[self._get_index_label_mask(index_labels)]

        if column_labels:
            filtered_index_df = filtered_index_df[self._get_data_columns_subset(column_labels)]

        # if index_accessor is a single label, it returns a series
        if isinstance(index_labels, (str, int)):
            return filtered_index_df.reset_index(drop=True).stack()

        return filtered_index_df
