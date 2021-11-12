.. _api/dataframe

=========
DataFrame
=========
.. currentmodule:: bach

Constructor
~~~~~~~~~~~
.. autosummary::
   :toctree: api/

   DataFrame


Methods todo
~~~~~~~~~~~
.. autosummary::
    :toctree: api/

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
   :toctree: api/

   DataFrame.index

.. autosummary::
   :toctree: api/

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
   :toctree: api/

   DataFrame.astype

Indexing, iteration
~~~~~~~~~~~~~~~~~~~
.. autosummary::
   :toctree: api/

   DataFrame.head


Function application, GroupBy & window
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
   :toctree: api/

   DataFrame.agg
   DataFrame.aggregate
   DataFrame.groupby
   DataFrame.rolling

.. _api.dataframe.stats:

Computations / descriptive stats
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
   :toctree: api/

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
   :toctree: api/

   DataFrame.drop
   DataFrame.head
   DataFrame.reset_index



Reshaping, sorting, transposing
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
   :toctree: api/

   DataFrame.sort_values


Combining / comparing / joining / merging
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. autosummary::
   :toctree: api/

   DataFrame.merge






