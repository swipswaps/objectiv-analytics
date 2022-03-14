"""
Copyright 2021 Objectiv B.V.
"""
from typing import TYPE_CHECKING
from bach_open_taxonomy.modelhub.aggregate import Aggregate
from bach_open_taxonomy.modelhub.map import Map
from bach.sql_model import BachSqlModel
from bach import DataFrame
from bach.types import get_dtype_from_db_dtype
from bach_open_taxonomy.stack.util import sessionized_data_model
from sql_models.constants import NotSet
from bach.series import Series
from typing import List, Union
from bach_open_taxonomy.series.series_objectiv import MetaBase

if TYPE_CHECKING:
    from bach.series import SeriesString, SeriesBoolean
    from bach_open_taxonomy.series import SeriesLocationStack

GroupByType = Union[List[Union[str, Series]], str, Series, NotSet]


TIME_DEFAULT_FORMAT = 'YYYY-MM-DD HH24:MI:SS.MS'


class ModelHub():
    def __init__(self,
                 start_date: str = None,
                 end_date: str = None,
                 time_aggregation: str = TIME_DEFAULT_FORMAT):
        self._time_aggregation = time_aggregation
        self._start_date = start_date
        self._end_date = end_date
        self._conversion_events = {}  # type: ignore

    @property
    def time_aggregation(self):
        """
        Time aggregation used for aggregation models as set with :py:meth:`from_objectiv_data`
        """
        return self._time_aggregation

    @property
    def start_date(self):
        """
        Start date as set with :py:meth:`from_objectiv_data`
        """
        return self._start_date

    @property
    def end_date(self):
        """
        End date as set with :py:meth:`from_objectiv_data`
        """
        return self._end_date

    @property
    def conversion_events(self):
        """
        Dictionary of all events that are labeled as conversion.

        Set with :py:meth:`add_conversion_event`
        """
        return self._conversion_events

    def _check_data_is_objectiv_data(self, df):
        if df.index_dtypes != {'event_id': 'uuid'}:
            raise ValueError(f"not right index {df.index_dtypes}")

        required_columns = {
            'day': 'date',
            'moment': 'timestamp',
            'user_id': 'uuid',
            'global_contexts': 'objectiv_global_context',
            'location_stack': 'objectiv_location_stack',
            'event_type': 'string',
            'stack_event_types': 'jsonb',
            'session_id': 'int64',
            'session_hit_number': 'int64'
        }

        if not (required_columns.items() <= df.dtypes.items()):
            raise ValueError(f"not right columns in DataFrame {df.dtypes.items()}"
                             f"should be {required_columns.items()}")

    def from_objectiv_data(self,
                           db_url: str = None,
                           table_name: str = 'data'):

        import sqlalchemy
        if db_url is None:
            import os
            db_url = os.environ.get('DSN', 'postgresql://objectiv:@localhost:5432/objectiv')
        engine = sqlalchemy.create_engine(db_url, pool_size=1, max_overflow=0)

        sql = f"""
            select column_name, data_type
            from information_schema.columns
            where table_name = '{table_name}'
            order by ordinal_position
        """

        with engine.connect() as conn:
            res = conn.execute(sql)
        dtypes = {x[0]: get_dtype_from_db_dtype(x[1]) for x in res.fetchall()}

        expected_columns = {'event_id': 'uuid',
                            'day': 'date',
                            'moment': 'timestamp',
                            'cookie_id': 'uuid',
                            'value': 'json'}
        if dtypes != expected_columns:
            raise KeyError(f'Expected columns not in table {table_name}. Found: {dtypes}')

        model = sessionized_data_model(start_date=self.start_date,
                                       end_date=self.end_date,
                                       table_name=table_name)
        # The model returned by `sessionized_data_model()` has different columns than the underlying table.
        # Note that the order of index_dtype and dtypes matters, as we use it below to get the model_columns
        index_dtype = {'event_id': 'uuid'}
        dtypes = {
            'day': 'date',
            'moment': 'timestamp',
            'user_id': 'uuid',
            'global_contexts': 'jsonb',
            'location_stack': 'jsonb',
            'event_type': 'string',
            'stack_event_types': 'jsonb',
            'session_id': 'int64',
            'session_hit_number': 'int64'
        }
        model_columns = tuple(index_dtype.keys()) + tuple(dtypes.keys())
        bach_model = BachSqlModel.from_sql_model(sql_model=model, columns=model_columns)

        from bach.savepoints import Savepoints
        df = DataFrame.get_instance(engine=engine,
                                    base_node=bach_model,
                                    index_dtypes=index_dtype,
                                    dtypes=dtypes,
                                    group_by=None,
                                    order_by=[],
                                    savepoints=Savepoints(),
                                    variables={}
                                    )

        df['global_contexts'] = df.global_contexts.astype('objectiv_global_context')
        df['location_stack'] = df.location_stack.astype('objectiv_location_stack')

        return df

    def add_conversion_event(self,
                             location_stack: 'SeriesLocationStack' = None,
                             event_type: str = None,
                             name: str = None):
        """
        Label events that are used as conversions. All labeled conversion events are set in
        :py:attr:`conversion_events`.

        :param location_stack: the location stack that is labeled as conversion. Can be any slice in of a
            objectiv_location_stack type column. Optionally use in conjunction with event_type to label a
            conversion.
        :param event_type: the event type that is labeled as conversion. Optionally use in conjunction with
            objectiv_location_stack to label a conversion.
        :param name: the name to use for the labeled conversion event. If None it will use 'conversion_#',
            where # is the number of the added conversion.
        """
        if location_stack is None and event_type is None:
            raise ValueError('At least one of conversion_stack or conversion_event should be set.')

        if not name:
            name = f'conversion_{len(self._conversion_events) + 1}'

        self._conversion_events[name] = location_stack, event_type

    def time_agg(self, time_aggregation: str = None) -> 'SeriesString':
        """
        Formats the moment column in the ObjectivFrame, returns a SeriesString.

        By default it uses the time_aggregation as set in the ObjectivFrame, unless overriden by the
        `time_aggregation` parameter.

        Use any template for aggreation from: https://www.postgresql.org/docs/14/functions-formatting.html
        ie. ``time_aggregation=='YYYY-MM-DD'`` aggregates by date.

        :param time_aggregation: if ``None``, it uses :py:attr:`ObjectivFrame.time_aggregation` set from the
            ObjectivFrame.
        :returns: SeriesString.
        """

        time_aggregation = self.time_aggregation if time_aggregation is None else time_aggregation
        return df.moment.dt.sql_format(time_aggregation).copy_override(name='time_aggregation')

    def to_metabase(self, df, model_type: str = None, config: dict = None):
        """
        Plot data in `df` to Metabase. If a card already exists, it will be updated. If `df` is a
        :py:class:`bach.Series`, it will call :py:meth:`bach.Series.to_frame`.

        Default options can be overridden using the config dictionary.

        :param df: :py:meth:`bach.DataFrame` or :py:meth:`bach.Series` to push to MetaBase.
        :param model_type: Preset output to Metabase for a specific model. eg, 'unique_users'
        :param config: Override default config options for the graph to be added/updated in Metabase.
        """

        metabase = MetaBase()
        return metabase.to_metabase(df, model_type, config)

    @property
    def map(self):
        """
        Access map methods from the model hub.

        .. autoclass:: Map
            :members:
            :noindex:

        """

        return Map(self)

    @property
    def agg(self):
        """
        Access aggregation methods from the model hub. Same as :py:meth:`aggregate`.

        .. autoclass:: Aggregate
            :members:
            :noindex:

        """

        return Aggregate(self)

    @property
    def aggregate(self):
        """
        Access aggregation methods from the model hub. Same as :py:meth:`agg`.

        .. autoclass:: Aggregate
            :members:
            :noindex:

        """
        return Aggregate(self)
