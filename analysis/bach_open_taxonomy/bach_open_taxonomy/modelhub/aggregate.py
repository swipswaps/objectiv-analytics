"""
Copyright 2021 Objectiv B.V.
"""
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from bach.series import SeriesBoolean, SeriesInt64


class Aggregate:
    """
    Models that return aggregated data in some form from the original ObjectivFrame.

    Methods in this class can be filtered with the filter parameter, which always takes SeriesBoolean. The
    ModelHub can also create specific commonly used filters with methods that return SeriesBoolean from
    :py:attr:`ModelHub.map`.
    """

    def __init__(self, df):
        self._df = df

    def _generic_aggregation(self, time_aggregation, column, filter, name):
        if not time_aggregation:
            time_aggregation = self._df._time_aggregation
        gb = self._df.moment.dt.sql_format(time_aggregation) if time_aggregation else None
        df = self._df.copy_override()
        if filter:
            df['_filter'] = filter
            if filter.expression.has_windowed_aggregate_function:
                df = df.materialize()
            df = df[df._filter]

            name += '_' + filter.name

        series = df.groupby(gb)[column].nunique()
        return series.copy_override(name=name)

    def unique_users(self, time_aggregation: str = None, filter: 'SeriesBoolean' = None) -> 'SeriesInt64':
        """
        Calculate the unique users in the ObjectivFrame.

        Use any template for aggreation from: https://www.postgresql.org/docs/14/functions-formatting.html
        ie. ``time_aggregation=='YYYY-MM-DD'`` aggregates by date.

        :param time_aggregation: if None, it uses the time_aggregation set in ObjectivFrame.
        :param filter: the output of this model is only based on the rows for which the filter is True.
        :returns: series with results.
        """

        return self._generic_aggregation(time_aggregation=time_aggregation,
                                         column='user_id',
                                         filter=filter,
                                         name='unique_users')

    def unique_sessions(self, time_aggregation: str = None, filter: 'SeriesBoolean' = None) -> 'SeriesInt64':
        """
        Calculate the unique sessions in the ObjectivFrame.

        Use any template for aggreation from: https://www.postgresql.org/docs/14/functions-formatting.html
        ie. ``time_aggregation=='YYYY-MM-DD'`` aggregates by date.

        :param time_aggregation: if None, it uses the time_aggregation set in ObjectivFrame.
        :param filter: the output of this model is only based on the rows for which the filter is True.
        :returns: series with results.
        """

        return self._generic_aggregation(time_aggregation=time_aggregation,
                                         column='session_id',
                                         filter=filter,
                                         name='unique_sessions')

    def session_duration(self, time_aggregation: str = None):
        """
        Calculate the average duration of sessions per time interval as set with ``time_aggregation``.

        :param time_aggregation: if None, it uses the time_aggregation set in ObjectivFrame.
        :returns: series with results.
        """
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

        total_sessions_user = self._df.groupby(['user_id']).aggregate({'session_id': 'nunique'})
        frequency = total_sessions_user.groupby('session_id_nunique').user_id.nunique()

        return frequency
