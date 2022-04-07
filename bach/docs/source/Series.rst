======
Series
======

.. currentmodule:: bach
  
.. Generate links in the toctree, but don't show the TOC itself in this page
.. rst-class:: hide_toctree_ul

.. toctree:: 

    bach_reference_series


.. Generate links in the toctree, but don't show the TOC itself in this page
.. rst-class:: hide_toctree_ul

.. toctree:: 

    bach_reference_series_by_function


A typed representation of a single column of data.

It can be used as a separate object to just deal with a single list of values. There are many standard
operations on Series available to do operations like add or subtract, to create aggregations like
:py:meth:`Series.nunique()` or :py:meth:`Series.count()`, or to create new sub-Series,
like :py:meth:`Series.unique()`.

Usage
-----
Almost every operation on a Series will return a Series with the operation set-up, allowing for complex
combinations of operations.

It should generally not be required to construct Series instances manually.
:py:class:`bach.DataFrame` will create them for you when required.

Slicing and index access
~~~~~~~~~~~~~~~~~~~~~~~~
Series support a few standard operations to get specific values:
Series[:3] will return the first 3 values of the Series. Sort order of the Series is important, so use
`Series.sort_values()` before slicing. Any slice with positive parameters is supported.

Index lookups like Series['key'] are also possible, and yield the value of the Series where the index
matches 'key'.

Database access
~~~~~~~~~~~~~~~
The data of this Series is always held in the database and operations on the data are performed
by the database, not in local memory. Data will only be transferred to local memory when an
explicit call is made to one of the functions that transfers data:

     * :py:meth:`bach.DataFrame.to_pandas()`
     * :py:meth:`bach.DataFrame.head()`
     * The property accessors :py:attr:`Series.value` (Series only),
       :py:attr:`Series.values`, and :py:attr:`Series.array`

If you really need the actual values, use the above, but in general it's better to use the Series that
generate them, as this will create more flexible code.

Boolean Operations
~~~~~~~~~~~~~~~~~~
A special subclass, :py:class:`SeriesBoolean`, can be used to filter
DataFrames, and these Series are easily created using comparison operations like equals (==),
less-than (<), not(~) on two Series: `boolean_Series = a == b`

More complex boolean operations like `a.isin(b)` are also supported, as well as multi-compares:
`a > b.any_value()` being True when there is a value in `b` where `a > b == True`

See :py:class:`SeriesBoolean` for more info on the operation and syntax.

Aggregations
~~~~~~~~~~~~
All Series support type-agnostic aggregations, and more specific aggregatations are available via Series
sub-classes. E.g. Numeric Series support artihmetic aggregation functions.

When a Series has aggregation setup (inherited from the Dataframe it's part of, or passed as an argument
to the aggregation function), it will use that aggregation instead of an aggregation over the full Series.

Window Functions
~~~~~~~~~~~~~~~~
All aggregation can also be used with a :py:class:`partitioning.Window`. A window defines the
subset of data on which the aggregation takes place. Unlike an aggregation, a window function returns a
value for every row in the data set.
Next to aggregations, window functions can also be used to create special values, like the one from the
previous row (using :py:meth:`Series.window_lag()`). All of these functions are in the
Series.window_* namespace.

Types
~~~~~
Series have a specific type that determines what kind of operations are available. All numeric Series
support arithmetic operations and aggregations for example. It may or may not be possible to perform
operations on different types. A comparison or arithmetic operation between a Int64 and Float Series
is okay, while a comparison operation is not.

The type of a Series can generally be changed by calling :py:meth:`Series.astype`.
