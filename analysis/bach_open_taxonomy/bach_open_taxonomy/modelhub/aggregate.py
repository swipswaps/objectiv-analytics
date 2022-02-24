"""
Copyright 2021 Objectiv B.V.
"""
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from bach.series import SeriesBoolean, SeriesInt64

from typing import (
    List, Union
)
from bach.series import SeriesTimestamp


class Aggregate:
    """
    Models that return aggregated data in some form from the original ObjectivFrame.

    Methods in this class can be filtered with the filter parameter, which always takes SeriesBoolean. The
    ModelHub can also create specific commonly used filters with methods that return SeriesBoolean from
    :py:attr:`ModelHub.map`.
    """

    def __init__(self, df):
        self._df = df

    @staticmethod
    def _check_groupby(objectivframe,
                       local_vars={},
                       these_columns_should_not_be_in_group_by: List[str] = []
                       ):

        if objectivframe.group_by:
            raise ValueError("can't run model hub models on a grouped DataFrame, please use parameters "
                             "(ie groupby, time_aggregation) of the model")

        groupby_possible = 'groupby' in local_vars.keys()
        time_aggregation_possible = 'time_aggregation' in local_vars.keys()

        if not (groupby_possible and time_aggregation_possible):
            return objectivframe

        groupby = local_vars.pop('groupby', None)
        time_aggregation = local_vars.pop('time_aggregation', None)

        groupby_list = groupby if isinstance(groupby, list) else [groupby]
        groupby_list = [] if groupby is None else groupby_list

        for key in groupby_list:
            if key in these_columns_should_not_be_in_group_by:
                raise ValueError(f'"{key}" is in groupby but is needed for aggregation: not allowed to '
                                 f'group on that')

        if time_aggregation and 'moment' not in groupby_list:
            raise KeyError("'moment' column should be in group by if time_aggregation is set")
        if time_aggregation is None:
            time_aggregation = objectivframe._time_aggregation

        groupby_list = [objectivframe[x].dt.sql_format(time_aggregation) if x == 'moment'
                        else x for x in groupby_list]
        grouped_df = objectivframe.groupby(groupby_list)

        return grouped_df

    def _generic_aggregation(self, local_vars, column, filter, name):
        df = self._check_groupby(objectivframe=self._df,
                                 local_vars=local_vars,
                                 these_columns_should_not_be_in_group_by=[column]).copy_override()
        if filter:
            df['_filter'] = filter
            if filter.expression.has_windowed_aggregate_function:
                df = df.materialize()
            df = df[df._filter]

            name += '_' + filter.name

        series = df[column].nunique()
        return series.copy_override(name=name)

    def unique_users(self,
                     time_aggregation: str = None,
                     filter: 'SeriesBoolean' = None,
                     groupby: Union[List[str], str] = 'moment') -> 'SeriesInt64':
        """
        Calculate the unique users in the ObjectivFrame.

        Use any template for aggreation from: https://www.postgresql.org/docs/14/functions-formatting.html
        ie. ``time_aggregation=='YYYY-MM-DD'`` aggregates by date.

        :param time_aggregation: sets the formatting of the moment column, if this column is included in the
            `groupby` parameter. if None, it uses the time_aggregation set in ObjectivFrame.
        :param filter: the output of this model is only based on the rows for which the filter is True.
        :param groupby: sets the column(s) to group by. Set to None, to aggregate over all data.
        :returns: series with results.
        """

        return self._generic_aggregation(local_vars=locals(),
                                         column='user_id',
                                         filter=filter,
                                         name='unique_users')

    def unique_sessions(self,
                        time_aggregation: str = None,
                        filter: 'SeriesBoolean' = None,
                        groupby: Union[List[str], str] = 'moment') -> 'SeriesInt64':
        """
        Calculate the unique sessions in the ObjectivFrame.

        Use any template for aggreation from: https://www.postgresql.org/docs/14/functions-formatting.html
        ie. ``time_aggregation=='YYYY-MM-DD'`` aggregates by date.

        :param time_aggregation: if None, it uses the time_aggregation set in ObjectivFrame.
        :param filter: the output of this model is only based on the rows for which the filter is True.
        :returns: series with results.
        """
        return self._generic_aggregation(local_vars=locals(),
                                         column='session_id',
                                         filter=filter,
                                         name='unique_sessions')

    def session_duration(self, time_aggregation: str = None, groupby='moment'):
        """
        Calculate the average duration of sessions per time interval as set with ``time_aggregation``.

        :param time_aggregation: if None, it uses the time_aggregation set in ObjectivFrame.
        :returns: series with results.
        """
        df = self._df.copy_override()
        df['moment2'] = df.moment
        df['session_id2'] = df.session_id

        new_groupby = [groupby] if isinstance(groupby, str) else groupby
        new_groupby = [] if groupby is None else new_groupby
        new_groupby = new_groupby + ['session_id2']

        print(f"{new_groupby=}")
        gdf = self._check_groupby(objectivframe=df, local_vars={'time_aggregation': time_aggregation,
                                                                'groupby': new_groupby})
        print('buh')
        session_duration = gdf.aggregate({'moment2': ['min', 'max']})
        session_duration['session_duration'] = session_duration['moment2_max']-session_duration['moment2_min']
        # remove "bounces"
        session_duration = session_duration[(session_duration['session_duration'] > '0')].reset_index()

        return session_duration.groupby(groupby).session_duration.mean()

    def frequency(self):
        """
        Calculate a frequency table for the number users by number of sessions.

        :returns: series with results.
        """
        df = self._check_groupby(objectivframe=self._df, local_vars=locals())

        total_sessions_user = df.groupby(['user_id']).aggregate({'session_id': 'nunique'})
        frequency = total_sessions_user.groupby(['session_id_nunique']).aggregate({'user_id': 'nunique'})

        return frequency
