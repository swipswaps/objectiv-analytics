.. _bach:

.. currentmodule:: bach

============
Introduction
============

Bach is Objectiv's data modeling library. With Bach, you can compose models with familiar Pandas-like
dataframe operations in your notebook. It uses a SQL abstraction layer that enables models to run on the
full dataset, and you can output models to SQL with a single command. It includes a set of operations that
enable effective feature creation for datasets that embrace the open taxonomy of analytics.

To get a taste of what you can do with Objectiv Bach, There is a `demo 
</docs/home/quickstart-guide>`_ available that enables you to run the full Objectiv pipeline on your local machine. It includes our website as a demo app, a Jupyter Notebook 
environment with working models and a Metabase environment to output data to.

What is Bach?
-------------
Bach is a library for analysing data that is stored in a SQL database. Currently we only support Postgres,
but we plan on supporting more databases. We're using an interface that's mostly compatible with `pandas
<https://pandas.pydata.org/docs/reference/index.html>`_. All data storage and
processing is handled by the database. As a result, local memory does not limit the size of the data that
can be analysed with Bach.

The two main data classes of Bach are the DataFrame and Series:

* A :py:class:`DataFrame` represents data in a tabular form, with all rows having the same
  columns, and each column having a specific data type and a distinct name.
* A :py:class:`Series` object represents a single column in a DataFrame, with
  different subclasses per data type that allow for type specific operations.

Get started with Bach
---------------------
Once your app is set up with the Objectiv tracker and the collector is running, follow the steps in the
`readme <https://github.com/objectiv/objectiv-analytics/tree/main/analysis#setup-objectiv-for-data-analysis>`_
to work with the data in python using Objectiv.