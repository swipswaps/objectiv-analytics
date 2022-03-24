.. currentmodule:: bach

=============================
Getting started with Objectiv
=============================

This example shows how to instantiate the model hub and a Bach DataFrame with Objectiv data that can be used
to analyze tracked data.
This DataFrame points to the data and all operations are done on this object. The data used in this example
is based on the data set that comes with our quickstart docker demo. A start date and an end date can
optionally be passed to limit the underlying data that is queried. The `time_aggregation` parameter determines
the default formatting of the timestamp of events. This is useful for grouping to different time aggregations,
ie. monthly or daily.

In the examples we assume that Objectiv data is store in a table called 'example' in a data base that can be
accessed with `db_url`.

.. code-block:: python

    from modelhub import ModelHub
    # instantiate the model hub
    modelhub = ModelHub(time_aggregation='YYYY-MM-DD')
    # get the Bach DataFrame with Objectiv data
    df = modelhub.get_objectiv_dataframe(db_url='postgresql://objectiv:@localhost:5432/objectiv'
                                         start_date='2022-01-04',
                                         time_aggregation='YYYY-MM-DD'
                                         table_name='example')

Your DataFrame is instantiated! We start with showing the first couple of rows from the data set.

.. code-block:: python

    df.head()

Take a look at one of the other examples to see how you can analyze your data.
