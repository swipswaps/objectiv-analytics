=========
DataFrame
=========

.. currentmodule:: bach

.. Generate links in the toctree, but don't show the TOC itself in this page
.. rst-class:: hide_toctree_ul

.. toctree:: 

    bach_reference_dataframe


.. Generate links in the toctree, but don't show the TOC itself in this page
.. rst-class:: hide_toctree_ul

.. toctree:: 

    bach_reference_dataframe_by_function

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
~~~~~~~~~~~~~~~~~~~~~~~~~
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
~~~~~~~~~~~~~~~~~~~~
Values, Series or DataFrames can be set to another DataFrame. Setting Series or DataFrames to another
DataFrame is possible if they share the same base node or index dtype. DataFrames and Series share the
same base node if they originate from the same data source. In most cases this means that the series
that is to be set to the DataFrame is a result of operations on the DataFrame that is started with.
If a Series or DataFrame do not share the same base node, the new column is or columns are set using a
merge on the index. This works for one level indexes where the dtype of the series is the same as the
DataFrame's index dtype.

Examples
~~~~~~~~
.. code-block:: python

    df['a'] = df.column_name + 5
    df['b'] = ''


Database access
~~~~~~~~~~~~~~~
The data of this DataFrame is always held in the database and operations on the data are performed
by the database, not in local memory. Data will only be transferred to local memory when an
explicit call is made to one of the functions that transfers data:

 * :py:meth:`DataFrame.head()`
 * :py:meth:`DataFrame.to_pandas()`
 * :py:meth:`DataFrame.get_sample()`
 * The property accessors :py:attr:`DataFrame.values`, :py:attr:`bach.Series.array` and
   :py:attr:`bach.Series.value` (Series only),

Other functions will not transfer data, nor will they trigger any operations to run on the database.
Operations on the DataFrame are combined and translated to a single SQL query, which is executed
only when one of the above mentioned data-transfer functions is called.

The API of this DataFrame is partially compatible with Pandas DataFrames. For more on Pandas
DataFrames see https://pandas.pydata.org/docs/reference/frame.html


