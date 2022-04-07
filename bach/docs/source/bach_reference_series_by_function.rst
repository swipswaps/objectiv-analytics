.. _bach_reference_series_by_function:

.. currentmodule:: bach

=====================
Reference by function
=====================

Creation / re-framing
~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
    :toctree: Series

    Series.from_const
    Series.to_frame
    Series.copy

Value accessors
~~~~~~~~~~~~~~~
.. autosummary::
    :toctree: Series

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
    :toctree: Series

    Series.name
    Series.index
    Series.group_by
    Series.sorted_ascending

Types
+++++
.. autosummary::
    :toctree: Series

    Series.dtype
    Series.astype

Sql Model
+++++++++
.. autosummary::
    :toctree: Series

    Series.base_node
    Series.view_sql

Comparison and set operations
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
    :toctree: Series

    Series.all_values
    Series.any_value
    Series.exists
    Series.isin
    Series.isnull
    Series.notnull

Conversion, reshaping, sorting
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
    :toctree: Series

    Series.sort_index
    Series.sort_values
    Series.fillna
    Series.append
    Series.drop_duplicates
    Series.dropna
    Series.unstack

Function application, aggregation & windowing
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
    :toctree: Series

    Series.agg
    Series.aggregate
    Series.apply_func

Computations & descriptive stats
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

All types
+++++++++

.. autosummary::
    :toctree: Series

    Series.describe
    Series.count
    Series.min
    Series.max
    Series.median
    Series.mode
    Series.nunique
    Series.value_counts

Numeric
+++++++
.. autosummary::
    :toctree: Series

    SeriesAbstractNumeric.cut
    SeriesAbstractNumeric.qcut
    SeriesAbstractNumeric.mean
    SeriesAbstractNumeric.quantile
    SeriesAbstractNumeric.sem
    SeriesAbstractNumeric.sum
    SeriesAbstractNumeric.std
    SeriesAbstractNumeric.std_pop
    SeriesAbstractNumeric.var
    SeriesAbstractNumeric.scale
    SeriesAbstractNumeric.minmax_scale

Window
++++++
.. autosummary::
    :toctree: Series

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
