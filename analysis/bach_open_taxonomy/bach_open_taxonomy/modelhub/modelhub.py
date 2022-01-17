"""
Copyright 2021 Objectiv B.V.
"""
from typing import TYPE_CHECKING
from bach_open_taxonomy.modelhub.aggregate import Aggregate
from bach_open_taxonomy.modelhub.map import Map
from bach_open_taxonomy.series.series_objectiv import MetaBase

if TYPE_CHECKING:
    from bach.series import SeriesBoolean


class ModelHub:
    """
    Class for the open model hub. Used in ObjectivFrame.

    The ModelHub contains a growing collection of open-source, free to use data models
    that you can take, chain and run to quickly build highly specific model stacks for product analysis and
    exploration. It includes models for a wide range of typical product analytics use cases.

    All models are compatible with datasets that have been validated against the open analytics taxonomy. The
    source is available for all models and you’re free to make any changes. You can use the included
    pandas-compatible Bach modeling library to customize them, or even add in advanced ML models.
    """
    def __init__(self, df):
        self._df = df

        # init metabase
        self._metabase = None

    def to_metabase(self, df, model_type: str = None, config: dict = None):
        """
        Plot data in `df` to Metabase. If a card already exists, it will be updated. If `df` is a
        :py:class:`bach.Series`, it will call :py:meth:`bach.Series.to_frame`.

        Default options can be overridden using the config dictionary.

        :param df: :py:meth:`bach.DataFrame` or :py:meth:`bach.Series` to push to MetaBase.
        :param model_type: Preset output to Metabase for a specific model. eg, 'unique_users'
        :param config: Override default config options for the graph to be added/updated in Metabase.
        """
        if not self._metabase:
            self._metabase = MetaBase()
        return self._metabase.to_metabase(df, model_type, config)

    def filter(self, filter: 'SeriesBoolean'):
        """
        Filters the ObjectivFrame for all hits where the filter is True.

        :param filter: SeriesBoolean, where hits are True for those returned.
        :returns: A filtered ObjectivFrame
        """
        df = self._df

        if self._df.base_node != filter.base_node:
            df = self._df.copy_override()
            df['__filter'] = filter
            filter = df['__filter']
            df.drop(columns=['__filter'], inplace=True)

        if filter.expression.has_windowed_aggregate_function:
            df = self._df.copy_override()
            df['__filter'] = filter
            df = df.materialize()
            filter = df['__filter']
            df.drop(columns=['__filter'], inplace=True)

        return df[filter]

    @property
    def map(self):
        """
        Access map methods from the model hub.

        .. autoclass:: Map
            :members:
            :noindex:

        """

        return Map(self._df)

    @property
    def agg(self):
        """
        Access aggregation methods from the model hub. Same as :py:meth:`aggregate`.

        .. autoclass:: Aggregate
            :members:
            :noindex:

        """

        return Aggregate(self._df)

    @property
    def aggregate(self):
        """
        Access aggregation methods from the model hub. Same as :py:meth:`agg`.

        .. autoclass:: Aggregate
            :members:
            :noindex:

        """
        return Aggregate(self._df)
