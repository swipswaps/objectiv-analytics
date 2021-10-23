from enum import Enum
from typing import List, Union, Dict, Any, Callable, cast

from buhtuh.series import BuhTuhSeries, BuhTuhSeriesInt64
from buhtuh.expression import Expression
from buhtuh.pandasql import BuhTuhDataFrame, SortColumn
from sql_models.model import CustomSqlModel, SqlModel


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
    """
    def __init__(self,
                 engine,
                 base_node: SqlModel,
                 group_by_columns: List[BuhTuhSeries]):

        self.engine = engine
        self.base_node = base_node
        self.index = {}

        for col in group_by_columns:
            if not isinstance(col, BuhTuhSeries):
                raise ValueError(f'Unsupported argument type: {type(col)}')
            assert col.base_node == base_node
            self.index[col.name] = col

        if len(group_by_columns) == 0:
            # create new dummy column so we can aggregate over everything
            self.index = {
                'index': BuhTuhSeriesInt64(
                    engine=self.engine,
                    base_node=self.base_node,
                    index={},
                    name='index',
                    expression=Expression.construct('1'))
            }

    def _get_group_by_columns(self):
        return ', '.join(g.get_column_expression() for g in self.index.values())

    def _get_group_by_expression(self):
        return ', '.join(g.expression.to_sql() for g in self.index.values())

    def get_node(self, series: List[BuhTuhSeries]):
        """
        Build a new node on our base_node, executing the group by, using the given series'
        setup with an aggregation function.
        """
        group_by_expression = self._get_group_by_expression()
        group_by_expression = f'group by {group_by_expression}' if group_by_expression != '' else ''

        model_builder = CustomSqlModel(
            sql="""
                select {group_by_columns}, {aggregate_columns}
                from {{prev}}
                {group_by_expression}
                """
        )
        node = model_builder(
            group_by_columns=self._get_group_by_columns(),
            aggregate_columns=', '.join([s.get_column_expression() for s in series]),
            group_by_expression=group_by_expression,
            prev=self.base_node
        )
        return node

    def to_frame(self, series: List[BuhTuhSeries]) -> BuhTuhDataFrame:
        """ Create a dataframe for this GroupBy """
        node = self.get_node(series)
        return BuhTuhDataFrame.get_instance(
            engine=self.engine,
            base_node=node,
            index_dtypes={n: t.dtype for n, t in self.index.items()},
            dtypes={a.name: a.dtype for a in series},
            order_by=[]
        )


class BuhTuhCube(BuhTuhGroupBy):
    """
    Very simple abstraction to support cubes
    """
    def _get_group_by_expression(self):
        return f'CUBE ({super()._get_group_by_expression()})'


class BuhTuhRollup(BuhTuhGroupBy):
    """
    Very simple abstraction to support rollups
    """
    def _get_group_by_expression(self):
        return f'ROLLUP ({super()._get_group_by_expression()})'


class BuhTuhGroupingList(BuhTuhGroupBy):
    """
    Abstraction to support SQL's
    GROUP BY (colA,colB), CUBE(ColC,ColD), ROLLUP(ColC,ColE)
    like expressions
    """
    grouping_list: List[BuhTuhGroupBy]

    def __init__(self, grouping_list: List[BuhTuhGroupBy]):
        """
        Given the list of groupbys, construct a combined groupby
        """
        self.grouping_list = grouping_list

        base_node = None
        engine = None
        group_by_columns = {}

        for g in grouping_list:
            if not isinstance(g, BuhTuhGroupBy):
                raise ValueError("Only BuhTuhGroupBy or BuhTuhAggregator items are supported")
            if base_node is None:
                base_node = g.base_node
                engine = g.engine
            if base_node != g.base_node:
                raise ValueError("BuhTuhGroupBy items should have the same underlying base node")

            for name, series in g.index.items():
                if name not in group_by_columns:
                    group_by_columns[name] = series

        if engine is None or base_node is None:
            # mostly to keep mypy happy
            raise ValueError("Could not find a engine/base_node")

        super().__init__(engine=engine, base_node=base_node,
                         group_by_columns=list(group_by_columns.values()))

    def _get_group_by_expression(self):
        grouping_str_list: List[str] = []
        for g in self.grouping_list:
            grouping_str_list.append(f'({g._get_group_by_expression()})')
        return f'{", ".join(grouping_str_list)}'


class BuhTuhGroupingSet(BuhTuhGroupingList):
    """
    Abstraction to support SQLs
    GROUP BY GROUPING SETS ((colA,colB),(ColA),(ColC))
    """
    def _get_group_by_expression(self):
        grouping_str_list: List[str] = []
        for g in self.grouping_list:
            grouping_str_list.append(f'({g._get_group_by_expression()})')
        return f'GROUPING SETS ({", ".join(grouping_str_list)})'


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
                 engine,
                 base_node: SqlModel,
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
        super().__init__(engine=engine, base_node=base_node, group_by_columns=group_by_columns)

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
        return BuhTuhWindow(engine=self.engine, base_node=self.base_node,
                            group_by_columns=list(self.index.values()),
                            order_by=self._order_by, mode=mode,
                            start_boundary=start_boundary, start_value=start_value,
                            end_boundary=end_boundary, end_value=end_value)

    def _get_order_by_sql(self) -> str:
        """
        Get a properly formatted order by clause based on this df's order_by.
        Will return an empty string in case ordering in not requested.
        """
        if self._order_by:
            order_str = ", ".join(
                f"{sc.expression.to_sql()} {'asc' if sc.asc else 'desc'}"
                for sc in self._order_by
            )
            order_str = f'order by {order_str}'
        else:
            order_str = ''

        return order_str

    def get_window_expression(self, window_func: Expression) -> Expression:
        """
        Given the window_func generate a statement like:
            {window_func} OVER (PARTITION BY .. ORDER BY ... frame_clause)
        """
        partition = ', '.join(g.expression.to_sql() for g in self.index.values())

        # TODO implement NULLS FIRST / NULLS LAST, probably not here but in the sorting logic.
        order_by = self._get_order_by_sql()

        if self.frame_clause is None:
            frame_clause = ''
        else:
            frame_clause = self.frame_clause

        over = f'OVER (PARTITION BY {partition} {order_by} {frame_clause})'

        if self._min_values is None or self._min_values == 0:
            return Expression.construct(f'{{}} {over}', window_func)
        else:
            # Only return a value when then minimum amount of observations (including NULLs)
            # has been reached.
            return Expression.construct(f"""
                CASE WHEN (count(1) {over}) >= {self._min_values}
                THEN {{}} {over}
                ELSE NULL END""", window_func)

    def _get_group_by_expression(self):
        """
        On a Window, there is no default group_by clause
        """
        return ''


class BuhTuhAggregator:
    """
    A wrapper to do aggregations on multiple series in a convenient way

    Uses the group_by that has been given at __init__ time and allows selection
    of series, multiple aggregations at once, etc.
    Proxies all of the series selection to BuhTuhDataFrame, and use BuhTuhGroupBy for tracking
    the aggregation.
    """
    buh_tuh: BuhTuhDataFrame
    group_by: BuhTuhGroupBy

    def __init__(self,
                 buh_tuh: BuhTuhDataFrame,
                 group_by: BuhTuhGroupBy):
        self.group_by = group_by

        aggregated_data = {name: series
                           for name, series in buh_tuh.all_series.items()
                           if name not in group_by.index.keys()}

        self.buh_tuh = buh_tuh.copy_override(
            index=group_by.index,
            series=aggregated_data
        )

    def aggregate(self,
                  func: Union[str, Callable, List[Union[str, Callable]],
                              Dict[str, Union[str, Callable, List[Union[str, Callable]]]]],
                  *args,
                  **kwargs) -> BuhTuhDataFrame:
        """ use/see agg() """
        return self.agg(func, *args, **kwargs)

    def agg(self,
            func: Union[str, Callable, List[Union[str, Callable]],
                        Dict[str, Union[str, Callable, List[Union[str, Callable]]]]],
            *args,
            **kwargs) -> BuhTuhDataFrame:
        """
        see BuhTuhDataFrame.agg()
        """
        return self.buh_tuh.agg(func, *args, group_by=self.group_by, **kwargs)

    def __getattr__(self, attr_name: str) -> Any:
        """ All methods that do not exists yet are potential aggregation methods. """
        try:
            return super().__getattribute__(attr_name)
        except AttributeError:
            return lambda *args, **kwargs: self.agg(attr_name, *args, **kwargs)

    def __getitem__(self, key: Union[str, List[str]]) -> 'BuhTuhAggregator':
        if not isinstance(key, (str, list, tuple)):
            raise KeyError(f'key should be a str or list but got {type(key)} instead.')
        if isinstance(key, str):
            key = [key]

        # Since key is a list, we get a dataframe, help mypy
        buh_tuh = cast(BuhTuhDataFrame, self.buh_tuh[key])
        return BuhTuhAggregator(buh_tuh, self.group_by)

    def _grouping_set_or_list(self,
                              other: Union['BuhTuhAggregator', List['BuhTuhAggregator']],
                              cls) -> 'BuhTuhAggregator':
        if not isinstance(other, list):
            other = [self, other]
        else:
            other = [self] + other

        return BuhTuhAggregator(buh_tuh=self.buh_tuh,
                                group_by=cls([a.group_by for a in other]))

    def grouping_set(self,
                     other: Union['BuhTuhAggregator', List['BuhTuhAggregator']],
                     ) -> 'BuhTuhAggregator':
        """
        Create a grouping set by combining this one with the ones given.
        :param other: another aggregator, or a list thereof
        """
        return self._grouping_set_or_list(other, BuhTuhGroupingSet)

    def grouping_list(self,
                      other: Union['BuhTuhAggregator', List['BuhTuhAggregator']]
                      ) -> 'BuhTuhAggregator':
        """
        Create a grouping set by combining this one with the ones given.
        :param other: another aggregator, or a list thereof
        """
        return self._grouping_set_or_list(other, BuhTuhGroupingList)
