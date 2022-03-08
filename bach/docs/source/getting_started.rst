.. currentmodule:: bach

=============================
Getting started with Objectiv
=============================

This example shows how to instantiate an Objectiv Frame that can be used to analyze Objectiv tracked data.
This points to the data and all operations are done on this object. The data used in this example is based on
the data set that comes with our quickstart docker demo. A start date and an end date can optionally be passed
to limit the underlying data that is queried. The `time_aggregation` parameter determines the default formatting
of the timestamp of events. This is useful for grouping to different time aggregations, ie. monthly or daily.

In the examples we assume that Objectiv data is store in a table called 'example' in a data base that can be
accessed with `db_url`.

.. code-block:: python

    from bach_open_taxonomy import ObjectivFrame
    of = ObjectivFrame.from_objectiv_data(db_url='postgresql://objectiv:@localhost:5432/objectiv'
                                          start_date='2022-01-04',
                                          time_aggregation='YYYY-MM-DD'
                                          table_name='example')

Your Objectiv Frame is instantiated! We start with showing the first couple of rows from the data set.

.. code-block:: python

    of.head()

Take a look at one of the other examples to see how you can analyze your data.
