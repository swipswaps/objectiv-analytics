=========
DataFrame
=========

.. currentmodule:: bach

A mutable DataFrame representing tabular data in a database and enabling operations on that data.

A Bach DataFrame object can be used to process large amounts of data on a database, while using an api
that is based on the pandas api. This allows the database to group and aggregate data, sample data and
do other operations that are not suitable for in memory processing. At any time it is possible to write
your Bach DataFrame to a pandas DataFrame.

Usage
-----
It should generally not be required to construct Series instances manually. A DataFrame can be constructed
using the any of the bach classmethods like from_table, from_model, or from_pandas. The returned DataFrame
can be thought of as a dict-like container for Bach Series objects.

Getting & Setting columns
-------------------------
Getting data works similar to pandas DataFrame. Single columns can be retrieved with df['column_name']
as well as df.column_name. This will return a single Bach Series. Multiple columns can be retrieved by
passing a list of column names like: `df[['column_name','other_column_name']]`. This returns a Bach
DataFrame.

A selection of rows can be selected with python slicing. I.e. `df[2:5]` returns row 2 to 5. Only positive
integers are currently accepted in slices.

SeriesBoolean can also be used to filter DataFrames, and these Series are easily created using comparison
operations like equals (==), less-than (<), not(~) on two series, or series with values:
boolean_series = a == b. Boolean indexing can be done like df[df.column == 5]. Only rows are returned for
which the condition is true.

Moving Series around
--------------------
Values, Series or DataFrames can be set to another DataFrame. Setting Series or DataFrames to another
DataFrame is possible if they share the same base node. This means that they originate from the same data
source. In most cases this means that the series that is to be set to the DataFrame is a result of
operations on the DataFrame that is started with.

Examples
--------
.. code-block:: python

    df['a'] = df.column_name + 5
    df['b'] = ''

If a Series of DataFrames do not share the same base node, it is possible to combine the data using
:py:meth:`DataFrame.merge()`.


Database access
---------------
The data of this DataFrame is always held in the database and operations on the data are performed
by the database, not in local memory. Data will only be transferred to local memory when an
explicit call is made to one of the functions that transfers data:

 * :py:meth:`DataFrame.head()`
 * :py:meth:`DataFrame.to_pandas()`
 * :py:meth:`DataFrame.get_sample()`
 * The property accessors :py:attr:`DataFrame.values`, :py:attr:`DataFrame.array` and
   :py:attr:`~bach.series.series.Series.value` (Series only),

Other functions will not transfer data, nor will they trigger any operations to run on the database.
Operations on the DataFrame are combined and translated to a single SQL query, which is executed
only when one of the above mentioned data-transfer functions is called.

The API of this DataFrame is partially compatible with Pandas DataFrames. For more on Pandas
DataFrames see https://pandas.pydata.org/docs/reference/frame.html

Constructor
~~~~~~~~~~~
.. autosummary::
   :toctree:

   DataFrame


Methods todo
~~~~~~~~~~~~
.. autosummary::
    :toctree:

    DataFrame.copy_override
    DataFrame.from_table
    DataFrame.from_model
    DataFrame.from_pandas
    DataFrame.get_instance
    DataFrame.materialize
    DataFrame.get_sample
    DataFrame.get_unsampled
    DataFrame.rename
    DataFrame.reset_index
    DataFrame.set_index
    DataFrame.drop
    DataFrame.window
    DataFrame.cube
    DataFrame.rollup
    DataFrame.expanding
    DataFrame.to_pandas
    DataFrame.array
    DataFrame.get_current_node
    DataFrame.view_sql

Attributes and underlying data
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
**Axes**

.. autosummary::
   :toctree:

   DataFrame.index

.. autosummary::
   :toctree:

   DataFrame.dtypes
   DataFrame.values

    DataFrame.engine
    DataFrame.base_node
    DataFrame.data
    DataFrame.order_by
    DataFrame.all_series
    DataFrame.index_columns
    DataFrame.index_dtypes
    DataFrame.dtypes
    DataFrame.group_by

Conversion
~~~~~~~~~~
.. autosummary::
   :toctree:

   DataFrame.astype

Indexing, iteration
~~~~~~~~~~~~~~~~~~~
.. autosummary::
   :toctree:

   DataFrame.head

Function application, GroupBy & window
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
   :toctree:

   DataFrame.agg
   DataFrame.aggregate
   DataFrame.groupby
   DataFrame.rolling

.. _api.dataframe.stats:

Computations / descriptive stats
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
   :toctree:

   DataFrame.count
   DataFrame.kurt
   DataFrame.kurtosis
   DataFrame.mad
   DataFrame.max
   DataFrame.mean
   DataFrame.median
   DataFrame.min
   DataFrame.mode
   DataFrame.prod
   DataFrame.product
   DataFrame.sem
   DataFrame.skew
   DataFrame.sum
   DataFrame.std
   DataFrame.var
   DataFrame.nunique

Reindexing / selection / label manipulation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
   :toctree:

   DataFrame.drop
   DataFrame.head
   DataFrame.reset_index

Reshaping, sorting, transposing
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
   :toctree:

   DataFrame.sort_values

Combining / comparing / joining / merging
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
   :toctree:

   DataFrame.merge






