"""
Copyright 2021 Objectiv B.V.
"""
import bach
from bach.expression import Expression
from bach.partitioning import WindowFrameBoundary


class Map:
    """
    Methods in this class can be used to map data in a DataFrame with Objectiv data to series values.

    Always returns Series with same index as the DataFrame the method is applied to, so the result can be set
    as columns to that DataFrame.
    """

    def __init__(self, mh):
        self._mh = mh

    def is_first_session(self, data: bach.DataFrame) -> bach.SeriesBoolean:
        """
        Labels all hits in a session True if that session is the first session of that user in the data.

        :param data: :py:class:`bach.DataFrame` to apply the method on.
        :returns: :py:class:`bach.SeriesBoolean` with the same index as ``data``.
        """

        self._mh._check_data_is_objectiv_data(data)

        window = data.groupby('user_id').window(end_boundary=WindowFrameBoundary.FOLLOWING)
        first_session = window['session_id'].min()
        series = first_session == data.session_id

        new_series = series.copy_override(name='is_first_session',
                                          index=data.index).to_frame().materialize().is_first_session

        return new_series

    def is_new_user(self, data: bach.DataFrame, time_aggregation: str = None) -> bach.SeriesBoolean:
        """
        Labels all hits True if the user is first seen in the period given `time_aggregation`.

        :param data: :py:class:`bach.DataFrame` to apply the method on.
        :param time_aggregation: if None, it uses the :py:attr:`ModelHub.time_aggregation` set in ModelHub
            instance.
        :returns: :py:class:`bach.SeriesBoolean` with the same index as ``data``.
        """

        self._mh._check_data_is_objectiv_data(data)

        window = data.groupby('user_id').window(end_boundary=WindowFrameBoundary.FOLLOWING)
        is_first_session = window['session_id'].min()

        window = data.groupby([self._mh.time_agg(data, time_aggregation),
                               'user_id']).window(end_boundary=WindowFrameBoundary.FOLLOWING)
        is_first_session_time_aggregation = window['session_id'].min()

        series = is_first_session_time_aggregation == is_first_session

        new_series = series.copy_override(name='is_new_user',
                                          index=data.index).to_frame().materialize().is_new_user

        return new_series

    def is_conversion_event(self, data: bach.DataFrame, name: str) -> bach.SeriesBoolean:
        """
        Labels a hit True if it is a conversion event, all other hits are labeled False.

        :param data: :py:class:`bach.DataFrame` to apply the method on.
        :param name: the name of the conversion to label as set in
            :py:attr:`ModelHub.conversion_events`.
        :returns: :py:class:`bach.SeriesBoolean` with the same index as ``data``.
        """

        self._mh._check_data_is_objectiv_data(data)

        conversion_stack, conversion_event = self._mh._conversion_events[name]

        if conversion_stack is None:
            series = data.event_type == conversion_event
        elif conversion_event is None:
            series = conversion_stack.notnull()
        else:
            series = ((conversion_stack.notnull()) & (data.event_type == conversion_event))
        return series.copy_override(name='is_conversion_event')

    def conversion_count(self, data: bach.DataFrame, name: str, partition='session_id') -> bach.SeriesInt64:
        """
        Counts the number of time a user is converted at a moment in time given a partition (ie 'session_id'
        or 'user_id').

        :param data: :py:class:`bach.DataFrame` to apply the method on.
        :param name: the name of the conversion to label as set in
            :py:attr:`ModelHub.conversion_events`.
        :param partition: the partition over which the number of conversions are counted. Can be any column
            in ``data``.
        :returns: :py:class:`bach.SeriesInt64` with the same index as ``data``.
        """

        self._mh._check_data_is_objectiv_data(data)

        data = data.copy_override()
        data['__conversion'] = self._mh.map.is_conversion_event(data, name)
        exp = f"case when {{}} then row_number() over (partition by {{}}, {{}}) end"
        expression = Expression.construct(exp, data['__conversion'], data[partition], data['__conversion'])
        data['__conversion_counter'] = data['__conversion']\
            .copy_override_dtype(dtype='int64')\
            .copy_override(expression=expression)
        data = data.materialize()
        exp = f"count({{}}) over (partition by {{}} order by {{}}, {{}})"
        expression = Expression.construct(exp,
                                          data['__conversion_counter'],
                                          data[partition],
                                          data[partition],
                                          data['moment'])
        data['conversion_count'] = data['__conversion_counter']\
            .copy_override_dtype('int64')\
            .copy_override(expression=expression)

        return data.conversion_count

    def pre_conversion_hit_number(self,
                                  data: bach.DataFrame,
                                  name: str,
                                  partition: str = 'session_id') -> bach.SeriesInt64:
        """
        Returns a count backwards from the first conversion, given the partition. I.e. first hit before
        converting is 1, second hit before converting 2, etc. Returns None if there are no conversions
        in the partition or after the first conversion.

        :param data: :py:class:`bach.DataFrame` to apply the method on.
        :param name: the name of the conversion to label as set in
            :py:attr:`ModelHub.conversion_events`.
        :param partition: the partition over which the number of conversions are counted. Can be any column
            in ``data``.
        :returns: :py:class:`bach.SeriesInt64` with the same index as ``data``.
        """

        self._mh._check_data_is_objectiv_data(data)

        data = data.copy_override()
        data['__conversions'] = self._mh.map.conversion_count(data, name=name)

        window = data.groupby(partition).window()
        converted = window['__conversions'].max()

        data['__is_converted'] = converted != 0
        data = data.materialize()
        pre_conversion_hits = data[data['__is_converted']]
        pre_conversion_hits = pre_conversion_hits[pre_conversion_hits['__conversions'] == 0]

        window = pre_conversion_hits.sort_values(['session_id',
                                                  'session_hit_number'],
                                                 ascending=False).groupby(partition).window()
        pre_conversion_hits['pre_conversion_hit_number'] = pre_conversion_hits.session_hit_number.\
            window_row_number(window)

        pre_conversion_hits = pre_conversion_hits.materialize()
        data['pre_conversion_hit_number'] = pre_conversion_hits['pre_conversion_hit_number']

        return data['pre_conversion_hit_number']
