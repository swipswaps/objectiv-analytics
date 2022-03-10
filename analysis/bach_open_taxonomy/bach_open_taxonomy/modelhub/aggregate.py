"""
Copyright 2021 Objectiv B.V.
"""
from bach import DataFrame
from typing import TYPE_CHECKING
from sql_models.constants import NotSet, not_set
from bach.series import Series
from typing import List, Union, Optional

if TYPE_CHECKING:
    from bach.series import SeriesBoolean, SeriesInt64

GroupByType = Union[List[Union[str, Series]], str, Series, NotSet]


class Aggregate:
    """
    Models that return aggregated data in some form from the original ObjectivFrame.

    Methods in this class can be filtered with the filter parameter, which always takes SeriesBoolean. The
    ModelHub can also create specific commonly used filters with methods that return SeriesBoolean from
    :py:attr:`ModelHub.map`.
    """

    def __init__(self, mh):
        self._mh = mh

    def _check_groupby(self,
                       df,
                       groupby: Union[List[Union[str, Series]], str, Series],
                       not_allowed_in_groupby: str = None
                       ):

        if df.group_by:
            raise ValueError("can't run model hub models on a grouped DataFrame, please use parameters "
                             "(ie groupby of the model")

        groupby_list = groupby if isinstance(groupby, list) else [groupby]
        groupby_list = [] if groupby is None else groupby_list

        if not_allowed_in_groupby is not None and not_allowed_in_groupby not in df.data_columns:
            raise ValueError(f'{not_allowed_in_groupby} column is required for this model but it is not in '
                             f'the ObjectivFrame')

        if not_allowed_in_groupby:
            for key in groupby_list:
                key = df[key] if isinstance(key, str) else key
                if key.equals(df[not_allowed_in_groupby]):
                    raise KeyError(f'"{not_allowed_in_groupby}" is in groupby but is needed for aggregation: '
                                   f'not allowed to group on that')

        grouped_df = df.groupby(groupby_list)
        return grouped_df

    def _generic_aggregation(self,
                             df,
                             groupby: Union[List[Union[str, Series]], str, Series],
                             column: str,
                             filter: Optional['SeriesBoolean'],
                             name: str):

        self._mh._check_data_is_objectiv_data(df)

        df = self._check_groupby(df=df,
                                 groupby=groupby,
                                 not_allowed_in_groupby=column)
        if filter:
            df['_filter'] = filter
            if filter.expression.has_windowed_aggregate_function:
                df = df.materialize()
            df = df[df._filter]

            name += '_' + filter.name

        series = df[column].nunique()
        return series.copy_override(name=name)

    def unique_users(self,
                     df: DataFrame,
                     filter: 'SeriesBoolean' = None,
                     groupby: GroupByType = not_set) -> 'SeriesInt64':
        """
        Calculate the unique users in the ObjectivFrame.

        :param filter: the output of this model is only based on the rows for which the filter is True.
        :param groupby: sets the column(s) to group by.
            - if `not_set` it defaults to using :py:attr:`ObjectivFrame.model_hub.time_agg`.
            - if None it aggregates over all data.
        :returns: series with results.
        """

        groupby = [self._mh.time_agg(df)] if groupby is not_set else groupby

        return self._generic_aggregation(df=df,
                                         groupby=groupby,
                                         column='user_id',
                                         filter=filter,
                                         name='unique_users')

    def unique_sessions(self,
                        df: DataFrame,
                        filter: 'SeriesBoolean' = None,
                        groupby: GroupByType = not_set) -> 'SeriesInt64':
        """
        Calculate the unique sessions in the ObjectivFrame.

        :param filter: the output of this model is only based on the rows for which the filter is True.
        :param groupby: sets the column(s) to group by.
            - if `not_set` it defaults to using :py:attr:`ObjectivFrame.model_hub.time_agg`.
            - if None it aggregates over all data.
        :returns: series with results.
        """

        groupby = [self._mh.time_agg(df)] if groupby is not_set else groupby

        return self._generic_aggregation(df=df,
                                         groupby=groupby,
                                         column='session_id',
                                         filter=filter,
                                         name='unique_sessions')

    def session_duration(self,
                         df: DataFrame,
                         groupby: GroupByType = not_set) -> 'SeriesInt64':
        """
        Calculate the average duration of sessions.

        :param groupby: sets the column(s) to group by.
            - if `not_set` it defaults to using :py:attr:`ObjectivFrame.model_hub.time_agg`.
            - if None it aggregates over all data.
        :returns: series with results.
        """

        self._mh._check_data_is_objectiv_data(df)

        if groupby is not_set:
            new_groupby = [self._mh.time_agg(df)]
        elif groupby is None:
            new_groupby = []
        elif not isinstance(groupby, list):
            new_groupby = [groupby]
        else:
            new_groupby = groupby
        new_groupby.append(df.session_id.copy_override(name='_session_id'))

        gdf = self._check_groupby(df=df, groupby=new_groupby)
        session_duration = gdf.aggregate({'moment': ['min', 'max']})
        session_duration['session_duration'] = session_duration['moment_max']-session_duration['moment_min']
        # remove "bounces"
        session_duration = session_duration[(session_duration['session_duration'] > '0')]

        return session_duration.groupby(session_duration.index_columns[:-1]).session_duration.mean()

    def frequency(self, df: DataFrame):
        """
        Calculate a frequency table for the number users by number of sessions.

        :returns: series with results.
        """

        self._mh._check_data_is_objectiv_data(df)

        total_sessions_user = df.groupby(['user_id']).aggregate({'session_id': 'nunique'})
        frequency = total_sessions_user.groupby(['session_id_nunique']).aggregate({'user_id': 'nunique'})

        return frequency
