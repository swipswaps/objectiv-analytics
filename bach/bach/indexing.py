from functools import reduce
from typing import Union, List


class LocIndexer(object):

    def __init__(self, obj):
        self.obj = obj

    def __getitem__(cls, x):
        if isinstance(x, tuple):
            index_accessor, column_accessor = x
        else:
            index_accessor = x
            column_accessor = None

        if isinstance(index_accessor, slice):
            filtered_index_df = cls._get_item_by_slicing(x.start, x.stop)
        else:
            filtered_index_df = cls._get_item_by_labels(index_accessor)

        if column_accessor:
            return filtered_index_df.all_series[column_accessor]

        return filtered_index_df

    def _get_item_by_labels(
        self, labels: Union[str, int, List[str], List[int], List['SeriesBoolean']],
    ):
        from bach import SeriesBoolean

        if not self.obj:
            raise ValueError('Cannot access rows by label if object has no index.')

        level_0_index = self.obj.index_columns[0]
        if isinstance(labels, (str, int)):
            return self.obj[self.obj.index[level_0_index] == labels].stack()

        loc_conditions = []
        for l in labels:
            if isinstance(l, SeriesBoolean):
                loc_conditions.append(l)
            else:
                loc_conditions.append(self.obj.index[level_0_index] == l)

        bool_series = reduce(
            lambda cond1, cond2: cond1 | cond2, loc_conditions,
        )
        return self.obj[bool_series]

    def _get_item_by_slicing(self, start, stop):
        from bach.partitioning import Window, WindowFrameMode

        if not self.obj.index and (start or stop):
            raise ValueError('Cannot slice rows if DataFrame/Series has no index.')

        if not self.obj.order_by:
            raise ValueError('Can only apply index slicing if DataFrame/Series is sorted.')

        level_0_index = self.obj.index_columns[0]

        numbered_df = self.obj.copy()
        numbered_df['position'] = numbered_df.all_series[level_0_index].window_row_number(
            window=Window([], mode=WindowFrameMode.ROWS, order_by=self.obj.order_by),
        )

        start_stop_df = numbered_df.materialize()[['position']]
        start_stop_df = start_stop_df.loc[[start, stop]].agg({'position': ['min', 'max']})

        sliced_df = numbered_df.merge(
            start_stop_df,
            how='inner',
            on=[
                numbered_df['position'] >= start_stop_df['position_min'],
                numbered_df['position'] <= start_stop_df['position_max'],
            ]
        )