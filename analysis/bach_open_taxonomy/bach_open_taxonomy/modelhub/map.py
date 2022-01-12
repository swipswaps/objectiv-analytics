"""
Copyright 2021 Objectiv B.V.
"""
from bach.expression import Expression
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from bach.series import SeriesBoolean


class Map:
    """
    Methods in this class can be used to map data in the Objectiv Frame to column values.

    Always returns Series with same base node and/or index as the ObjectivFrame the method is applied
    to.
    """

    def __init__(self, df):
        self._df = df

    def is_first_session(self) -> 'SeriesBoolean':
        """
        Labels a session True if the session is the first session of that user in the data.

        :returns: SeriesBoolean with same base node as the ObjectivFrame this method is applied to.
        """

        window = self._df.groupby('user_id').window()
        first_session = window['session_id'].min()
        series = first_session == self._df.session_id
        return series.copy_override(name='is_first_session')

    def is_new_user(self, time_aggregation=None) -> 'SeriesBoolean':
        """
        Labels a user True if the user is first seen in the given time_aggregation.

        :returns: SeriesBoolean with same base node as the ObjectivFrame this method is applied to.
        """

        if not time_aggregation:
            time_aggregation = self._df._time_aggregation

        window = self._df.groupby('user_id').window()
        is_first_session = window['session_id'].min()

        window = self._df.groupby([self._df.moment.dt.sql_format(time_aggregation), 'user_id']).window()
        is_first_session_time_aggregation = window['session_id'].min()

        series = is_first_session_time_aggregation == is_first_session

        return series.copy_override(name='is_new_user')

    def is_conversion(self, name):
        """
        Labels a hit True if it is a conversion hit.

        :param name: the name of the conversion to label as set in
            :py:attr:`bach_open_taxonomy.ObjectivFrame.conversion_events`.
        :returns: SeriesBoolean with same base node as the ObjectivFrame this method is applied to.
        """

        conversion_stack, conversion_event = self._df._conversion_events[name]

        if conversion_stack is None:
            series = self._df.event_type == conversion_event
        elif conversion_event is None:
            series = conversion_stack.notnull()
        else:
            series = ((conversion_stack.notnull()) & (self._df.event_type == conversion_event))
        return series.copy_override(name='conversion')

    def conversions(self, name, partition='session_id'):
        """
        Counts the number of time a user is converted at a moment in time given a partition (ie session_id
        or user_id).

        :returns: series with conversion counter per partition.
        """
        df = self._df.copy_override()
        df['_conversion'] = df.mh.map.is_conversion(name)
        df = df.materialize()
        exp = f"case when {{}} then row_number() over (partition by {{}}, {{}}) end"
        df['_conversion_counter'] = df['_conversion'].copy_override(
            dtype='int64',
            expression=Expression.construct(exp, df['_conversion'], df[partition], df['_conversion']))
        df = df.materialize()
        exp = f"count({{}}) over (partition by {{}} order by {{}}, {{}})"
        df = df.materialize()
        df['conversions'] = df['_conversion_counter'].copy_override(
            dtype='int64',
            expression=Expression.construct(exp,
                                            df['_conversion_counter'],
                                            df[partition],
                                            df[partition],
                                            df['moment']))

        return df.conversions

    def funnel(self, name, filter: 'SeriesBoolean' = None, partition='session_id'):
        df = self._df.copy_override()
        if filter:
            df['_filter'] = filter

        df['__conversions'] = df.mh.map.conversions(name=name)

        window = df.groupby(partition).window()
        converted = window['__conversions'].max()

        df['__is_converted'] = converted != 0
        df = df.materialize()
        pre_conversion_hits = df[df['__is_converted']]
        pre_conversion_hits = pre_conversion_hits[pre_conversion_hits['__conversions'] == 0]

        if filter:
            pre_conversion_hits = pre_conversion_hits[pre_conversion_hits._filter]

        window = pre_conversion_hits.sort_values(['session_id',
                                                  'session_hit_number'],
                                                 ascending=[True,
                                                            False]).groupby('session_id').window()
        pre_conversion_hits['hit_number_before_converting'] = pre_conversion_hits.session_hit_number.\
            window_row_number(window)

        pre_conversion_hits = pre_conversion_hits.materialize()
        df['hit_number_before_converting'] = pre_conversion_hits['hit_number_before_converting']
        return df['hit_number_before_converting']
