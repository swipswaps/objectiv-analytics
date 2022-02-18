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

    def _check_groupby(self,
                       local_vars={},
                       these_columns_should_not_be_in_group_by: List[str] = []
                       ):

        if self._df.group_by:
            raise ValueError("can't run model hub models on a grouped DataFrame, please use parameters "
                             "(ie groupby, time_aggregation) of the model")

        groupby_possible = 'groupby' in local_vars.keys()
        time_aggregation_possible = 'time_aggregation' in local_vars.keys()

        if not (groupby_possible and time_aggregation_possible):
            return self._df

        groupby = local_vars.pop('groupby', None)
        time_aggregation = local_vars.pop('time_aggregation', None)
        if time_aggregation is None:
            time_aggregation = self._df._time_aggregation
            # todo is setting timeaggregation in the ObjectivFrame really a good idea?

        groupby_list = groupby if isinstance(groupby, list) else [groupby]
        groupby_list = [] if groupby is None else groupby_list

        if time_aggregation and time_aggregation_possible:
            there_is_no_timestamp_column = True
            for idx, name in enumerate(groupby_list):
                if isinstance(self._df[name], SeriesTimestamp):
                    groupby_list[idx] = self._df[name].dt.sql_format(time_aggregation)
                    there_is_no_timestamp_column = False
            if there_is_no_timestamp_column:
                groupby_list.append(self._df.moment.dt.sql_format(time_aggregation))
        grouped_df = self._df.groupby(groupby_list)

        for key in grouped_df.group_by.index.keys():
            if key in these_columns_should_not_be_in_group_by:
                raise ValueError(f'"{key}" is in groupby but is needed for aggregation: not allowed to '
                                 f'group on that')

        return grouped_df

    def _generic_aggregation(self, local_vars, column, filter, name):
        df = self._check_groupby(local_vars=local_vars,
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
                     groupby: Union[List[str], str] = None) -> 'SeriesInt64':
        """
        Calculate the unique users in the ObjectivFrame.

        Use any template for aggreation from: https://www.postgresql.org/docs/14/functions-formatting.html
        ie. ``time_aggregation=='YYYY-MM-DD'`` aggregates by date.

        :param time_aggregation: if None, it uses the time_aggregation set in ObjectivFrame.
        :param filter: the output of this model is only based on the rows for which the filter is True.
        :returns: series with results.
        """

        return self._generic_aggregation(local_vars=locals(),
                                         column='user_id',
                                         filter=filter,
                                         name='unique_users')

    def unique_sessions(self, time_aggregation: str = None, filter: 'SeriesBoolean' = None,
                        groupby=None) -> 'SeriesInt64':
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

    def session_duration(self, time_aggregation: str = None):
        """
        Calculate the average duration of sessions per time interval as set with ``time_aggregation``.

        :param time_aggregation: if None, it uses the time_aggregation set in ObjectivFrame.
        :returns: series with results.
        """
        df = self._check_groupby(local_vars=locals())
        df = self._df.copy_override()
        df['moment2'] = df.moment
        if not time_aggregation:
            time_aggregation = self._df._time_aggregation
        gb = ['session_id']
        if time_aggregation:
            gb = ['session_id', df.moment.dt.sql_format(time_aggregation)]

        session_duration = df.groupby(gb).aggregate({'moment2': ['min', 'max']})
        session_duration['session_duration'] = session_duration['moment2_max']-session_duration['moment2_min']
        # remove "bounces"
        session_duration = session_duration[(session_duration['session_duration'] > '0')]
        if time_aggregation:
            return session_duration.groupby('moment').session_duration.mean()
        else:
            return session_duration.session_duration.mean()

    def frequency(self):
        """
        Calculate a frequency table for the number users by number of sessions.

        :returns: series with results.
        """
        df = self._check_groupby(local_vars=locals())

        total_sessions_user = df.groupby(['user_id']).aggregate({'session_id': 'nunique'})
        frequency = total_sessions_user.groupby(['session_id_nunique']).aggregate({'user_id': 'nunique'})

        return frequency
