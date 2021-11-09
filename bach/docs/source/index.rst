.. _bach:

Welcome to Bach's documentation!
==================================

Bach is Objectiv's data modeling library. With Bach, you can compose models with familiar Pandas-like dataframe operations in your notebook. It uses an SQL abstraction layer that enables models to run on the full dataset, and you can output models to SQL with a single command. It includes a set of operations that enable effective feature creation for datasets that embrace the open taxonomy of analytics.

We've set up a [sandboxed notebook](https://notebook.objectiv.io/lab?path=product_analytics.ipynb) for you to play with Bach to see what it can do.



Bach
------

.. autosummary::
    :toctree: bach

    bach.dataframe
    bach.expression
    bach.from_pandas
    bach.merge
    bach.partitioning
    bach.sql_model
    bach.types


Series
------

.. autosummary::
    :toctree: bach/series

    bach.series.series_boolean
    bach.series.series_datetime
    bach.series.series_json
    bach.series.series_numeric
    bach.series.series_string
    bach.series.series_uuid
    bach.series.series


Sql Models
----------
.. autosummary::
    :toctree: sql_models

    sql_models.cli_util
    sql_models.graph_operations
    sql_models.model
    sql_models.sql_generator
    sql_models.sql_query_parser
    sql_models.util


