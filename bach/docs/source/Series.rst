======
Series
======

.. currentmodule:: bach

Introduction
------------
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
series[:3] will return the first 3 values of the Series. Sort order of the series is important, so use
`Series.sort_values()` before slicing. Any slice with positive parameters is supported.

Index lookups like series['key'] are also possible, and yield the value of the series where the index
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
less-than (<), not(~) on two series: `boolean_series = a == b`

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
Series have a specific type that determines what kind of operations are available. All numeric series
support arithmetic operations and aggregations for example. It may or may not be possible to perform
operations on different types. A comparison or arithmetic operation between a Int64 and Float Series
is okay, while a comparison operation is not.

The type of a Series can generally be changed by calling :py:meth:`Series.astype`.

bach.Series reference
---------------------
.. autosummary::
    :template: autosummary/class_short.rst
    :toctree: series

    Series
    SeriesBoolean
    SeriesAbstractNumeric
    SeriesString
    SeriesJsonb
    SeriesJson

bach.Series reference by function
---------------------------------

Creation / re-framing
~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
    :toctree: series

    Series.from_const
    Series.to_frame

Value accessors
~~~~~~~~~~~~~~~
.. autosummary::
    :toctree: series

    Series.head
    Series.to_pandas
    Series.array
    Series.values
    Series.value

Attributes and underlying data
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Axes
++++
.. autosummary::
    :toctree: series

    Series.name
    Series.index
    Series.group_by
    Series.sorted_ascending

Types
+++++
.. autosummary::
    :toctree: series

    Series.dtype
    Series.astype

Sql Model
+++++++++
.. autosummary::
    :toctree: series

    Series.engine
    Series.base_node
    Series.view_sql

Comparison and set operations
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
    :toctree: series

    Series.all_values
    Series.any_value
    Series.exists
    Series.isin
    Series.isnull
    Series.notnull

Conversion, reshaping, sorting
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
    :toctree: series

    Series.sort_values
    Series.fillna

Function application, aggregation & windowing
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
    :toctree: series

    Series.agg
    Series.aggregate
    Series.apply_func

Computations & descriptive stats
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

All types
+++++++++

.. autosummary::
    :toctree: series

    Series.count
    Series.min
    Series.max
    Series.median
    Series.mode
    Series.nunique

Numeric
+++++++
.. autosummary::
    :toctree: series

    SeriesAbstractNumeric.mean
    SeriesAbstractNumeric.sem
    SeriesAbstractNumeric.sum
    SeriesAbstractNumeric.std
    SeriesAbstractNumeric.var

Window
++++++
.. autosummary::
    :toctree: series

    Series.window_first_value
    Series.window_lag
    Series.window_nth_value
    Series.window_lead
    Series.window_last_value

    Series.window_row_number
    Series.window_rank
    Series.window_dense_rank
    Series.window_percent_rank

    Series.window_ntile
    Series.window_cume_dist
