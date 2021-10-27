from copy import copy
from enum import Enum
from typing import List, Dict

from buhtuh.series import BuhTuhSeries, BuhTuhSeriesInt64
from buhtuh.expression import Expression
from buhtuh.dataframe import SortColumn


class BuhTuhWindowFrameMode(Enum):
    """
    Class representing the frame mode in a BuhTuhWindow
    """
    ROWS = 0
    RANGE = 1


class BuhTuhWindowFrameBoundary(Enum):
    """
    Class representing the frame boundaries in a BuhTuhWindow
        """

    # Order is important here (see third restriction above)
    PRECEDING = 0
    CURRENT_ROW = 1
    FOLLOWING = 2

    def frame_clause(self, value: int = None) -> str:
        """
        Generate the frame boundary sub-string
        """
        if self == self.CURRENT_ROW:
            if value is not None:
                raise ValueError('Value not supported with CURRENT ROW')
            return 'CURRENT ROW'
        else:
            if value is None:
                return f'UNBOUNDED {self.name}'
            else:
                return f'{value} {self.name}'


class BuhTuhGroupBy:
    """
    Class to build GROUP BY expressions. This is the basic building block to create more complex
    expressions. This class represents a grouping/partitioning by columns/series or expressions
    thereof.

    For more complex grouping expressions, this class should be extended.

    Instances of this class and subclasses are **immutable**. Any modifying operations should
    return a fresh copy.
    """
    def __init__(self, group_by_columns: List[BuhTuhSeries]):

        self._index = {}

        for col in group_by_columns:
            if not isinstance(col, BuhTuhSeries):
                raise ValueError(f'Unsupported argument type: {type(col)}')
            self._index[col.name] = col.copy_override(index={}, group_by=[self])

        if len(group_by_columns) == 0:
            raise ValueError('Pass a dummy column for DataFrame-wide aggregations; use '
                             'BuhTuhGroupBy.get_dummy_index_series() to create one')

    def __eq__(self, other):
        if not isinstance(other, BuhTuhGroupBy):
            return False
        return (
            list(self._index.keys()) == list(other.index.keys()) and
            all(self._index[n].equals(other.index[n], recursion='BuhTuhGroupBy')
                for n in self._index.keys())
        )

    def get_index_column_expression(self) -> Expression:
        fmtstr = ', '.join(['{}'] * len(self._index))
        return Expression.construct(fmtstr, *[g.get_column_expression()
                                              for g in self._index.values()])

    def get_group_by_column_expression(self) -> Expression:
        fmtstr = ', '.join(['{}'] * len(self._index))
        return Expression.construct(fmtstr, *[g.expression for g in self._index.values()])

    @property
    def index(self) -> Dict[str, BuhTuhSeries]:
        return copy(self._index)

    @classmethod
    def get_dummy_index_series(cls, engine, base_node, name='index'):
        return BuhTuhSeriesInt64(
                engine=engine,
                base_node=base_node,
                index={},
                name=name,
                expression=Expression.construct('1'),
                # Will be set the moment it's passed to BuhTuhGroupBy.__init__
                group_by=None)


class BuhTuhCube(BuhTuhGroupBy):
    """
    Very simple abstraction to support cubes
    """
    def get_group_by_column_expression(self):
        return Expression.construct('cube ({})', super().get_group_by_column_expression())


class BuhTuhRollup(BuhTuhGroupBy):
    """
    Very simple abstraction to support rollups
    """
    def get_group_by_column_expression(self):
        return Expression.construct('rollup ({})', super().get_group_by_column_expression())


class BuhTuhGroupingList(BuhTuhGroupBy):
    """
    Abstraction to support SQL's
    GROUP BY (colA,colB), CUBE(ColC,ColD), ROLLUP(ColC,ColE)
    like expressions
    """
    _grouping_list: List[BuhTuhGroupBy]

    def __init__(self, grouping_list: List[BuhTuhGroupBy]):
        """
        Given the list of groupbys, construct a combined groupby
        """
        self._grouping_list = grouping_list

        group_by_columns = {}

        for g in grouping_list:
            if not isinstance(g, BuhTuhGroupBy):
                raise ValueError("Only BuhTuhGroupBy items are supported")

            for name, series in g._index.items():
                if name not in group_by_columns:
                    group_by_columns[name] = series

        super().__init__(group_by_columns=list(group_by_columns.values()))

    def get_group_by_column_expression(self):
        grouping_expr_list = [g.get_group_by_column_expression() for g in self._grouping_list]
        fmtstr = ", ".join(["({})"] * len(grouping_expr_list))
        return Expression.construct(fmtstr, *grouping_expr_list)


class BuhTuhGroupingSet(BuhTuhGroupingList):
    """
    Abstraction to support SQLs
    GROUP BY GROUPING SETS ((colA,colB),(ColA),(ColC))
    """
    def get_group_by_column_expression(self):
        grouping_expr_list = [g.get_group_by_column_expression() for g in self._grouping_list]
        fmtstr = ", ".join(["({})"] * len(grouping_expr_list))
        fmtstr = f'grouping sets ({fmtstr})'
        return Expression.construct(fmtstr, *grouping_expr_list)


class BuhTuhWindow(BuhTuhGroupBy):
    """
    Class representing an "immutable" window as defined in the SQL standard. Any operation on this
    class that would alter it returns a fresh copy. It can be reused many time if the window
    is reused.

    A Window for us is basically a partitioned, sorted view on a DataFrame, where the frame
    boundaries as given in the constructor, or in set_frame_clause(), define the window.

    A frame is defined in PG as follows:
    (See https://www.postgresql.org/docs/14/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS)

    { RANGE | ROWS } frame_start
    { RANGE | ROWS } BETWEEN frame_start AND frame_end
    where frame_start and frame_end can be one of

    UNBOUNDED PRECEDING
    value PRECEDING
    CURRENT ROW
    value FOLLOWING
    UNBOUNDED FOLLOWING

    The frame_clause specifies the set of rows constituting the window frame, for those window
    functions that act on the frame instead of the whole partition.

    If frame_end is omitted it
    defaults to CURRENT ROW.

    Restrictions are that
    - frame_start cannot be UNBOUNDED FOLLOWING,
    - frame_end cannot be UNBOUNDED PRECEDING
    - frame_end choice cannot appear earlier in the above list than the frame_start choice:
        for example RANGE BETWEEN CURRENT ROW AND value PRECEDING is not allowed.

    The default framing option is RANGE UNBOUNDED PRECEDING, which is the same as
    RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW; it sets the frame to be all rows from
    the partition start up through the current row's last peer in the ORDER BY ordering
    (which means all rows if there is no ORDER BY).

    In general, UNBOUNDED PRECEDING means that the frame starts with the first row of the
    partition, and similarly UNBOUNDED FOLLOWING means that the frame ends with the last row
    of the partition (regardless of RANGE or ROWS mode).

    In ROWS mode, CURRENT ROW means that the frame starts or ends with the current row;
    In RANGE mode it means that the frame starts or ends with the current row's first or
    last peer in the ORDER BY ordering.

    The value PRECEDING and value FOLLOWING cases are currently only allowed in ROWS mode.
    They indicate that the frame starts or ends with the row that many rows before or after
    the current row.

    value must be an integer expression not containing any variables, aggregate functions,
    or window functions. The value must not be null or negative; but it can be zero,
    which selects the current row itself.
    """
    def __init__(self,
                 group_by_columns: List['BuhTuhSeries'],
                 order_by: List[SortColumn],
                 mode: BuhTuhWindowFrameMode = BuhTuhWindowFrameMode.RANGE,
                 start_boundary: BuhTuhWindowFrameBoundary = BuhTuhWindowFrameBoundary.PRECEDING,
                 start_value: int = None,
                 end_boundary: BuhTuhWindowFrameBoundary = BuhTuhWindowFrameBoundary.CURRENT_ROW,
                 end_value: int = None,
                 min_values: int = None):
        """
        Define a window on a DataFrame, by giving the partitioning series and the frame definition
        :see: class definition for more info on the frame definition, and BuhTuhGroupBy for more
              info on grouping / partitioning
        """
        super().__init__(group_by_columns=group_by_columns)

        if mode is None:
            raise ValueError("Mode needs to be defined")

        if start_boundary is None:
            raise ValueError("At least start_boundary needs to be defined")

        if start_boundary == BuhTuhWindowFrameBoundary.FOLLOWING and start_value is None:
            raise ValueError("Start of frame can not be unbounded following")

        if end_boundary == BuhTuhWindowFrameBoundary.PRECEDING and end_value is None:
            raise ValueError("End of frame can not be unbounded preceding")

        if (start_value is not None and start_value < 0) or \
                (end_value is not None and end_value < 0):
            raise ValueError("start_value and end_value must be greater than or equal to zero.")

        if mode == BuhTuhWindowFrameMode.RANGE \
                and (start_value is not None or end_value is not None):
            raise ValueError("start_value or end_value cases only supported in ROWS mode.")

        if end_boundary is not None:
            if start_boundary.value > end_boundary.value:
                raise ValueError("frame boundaries defined in wrong order.")

            if start_boundary == end_boundary:
                if start_boundary == BuhTuhWindowFrameBoundary.PRECEDING \
                        and start_value is not None \
                        and end_value is not None \
                        and start_value < end_value:
                    raise ValueError("frame boundaries defined in wrong order.")

            if start_boundary == end_boundary:
                if start_boundary == BuhTuhWindowFrameBoundary.FOLLOWING \
                        and start_value is not None \
                        and end_value is not None \
                        and start_value > end_value:
                    raise ValueError("frame boundaries defined in wrong order.")

        self._mode = mode
        self._start_boundary = start_boundary
        self._start_value = start_value
        self._end_boundary = end_boundary
        self._end_value = end_value
        self._min_values = 0 if min_values is None else min_values

        # TODO This should probably be an expression
        self._frame_clause: str
        if end_boundary is None:
            self._frame_clause = f'{mode.name} {start_boundary.frame_clause(start_value)}'
        else:
            self._frame_clause = f'{mode.name} BETWEEN {start_boundary.frame_clause(start_value)}'\
                                f' AND {end_boundary.frame_clause(end_value)}'

        self._order_by = order_by

    @property
    def frame_clause(self) -> str:
        return self._frame_clause

    @property
    def order_by(self) -> List[SortColumn]:
        return self._order_by

    @property
    def min_values(self) -> int:
        return self._min_values

    def set_frame_clause(self,
                         mode:
                         BuhTuhWindowFrameMode = BuhTuhWindowFrameMode.RANGE,
                         start_boundary:
                         BuhTuhWindowFrameBoundary = BuhTuhWindowFrameBoundary.PRECEDING,
                         start_value: int = None,
                         end_boundary:
                         BuhTuhWindowFrameBoundary = BuhTuhWindowFrameBoundary.CURRENT_ROW,
                         end_value: int = None) -> 'BuhTuhWindow':
        """
        Convenience function to clone this window with new frame parameters
        :see: __init__()
        """
        return BuhTuhWindow(group_by_columns=list(self._index.values()),
                            order_by=self._order_by, mode=mode,
                            start_boundary=start_boundary, start_value=start_value,
                            end_boundary=end_boundary, end_value=end_value)

    def _get_order_by_expression(self) -> Expression:
        """
        Get a properly formatted order by clause based on this df's order_by.
        Will return an empty string in case ordering in not requested.
        """
        if self._order_by:
            exprs = [sc.expression for sc in self._order_by]
            fmtstr = [f"{{}} {'asc' if sc.asc else 'desc'}" for sc in self._order_by]
            return Expression.construct(f'order by {", ".join(fmtstr)}', *exprs)
        else:
            return Expression.construct('')

    def get_window_expression(self, window_func: Expression) -> Expression:
        """
        Given the window_func generate a statement like:
            {window_func} OVER (PARTITION BY .. ORDER BY ... frame_clause)
        """
        # TODO implement NULLS FIRST / NULLS LAST, probably not here but in the sorting logic.
        order_by = self._get_order_by_expression()

        if self.frame_clause is None:
            frame_clause = ''
        else:
            frame_clause = self.frame_clause

        partition_fmt = ", ".join(['{}'] * len(self.index))

        over_fmt = f'over (partition by {partition_fmt} {{}} {frame_clause})'
        over_expr = Expression.construct(over_fmt,
                                         *[i.expression for i in self.index.values()],
                                         order_by)

        if self._min_values is None or self._min_values == 0:
            return Expression.construct(f'{{}} {{}}', window_func, over_expr)
        else:
            # Only return a value when then minimum amount of observations (including NULLs)
            # has been reached.
            return Expression.construct(f"""
                case when (count(1) {{}}) >= {self._min_values}
                then {{}} {{}}
                else NULL end""", over_expr, window_func, over_expr)

    def get_group_by_column_expression(self):
        """
        On a Window, there is no default group_by clause
        """
        return None
