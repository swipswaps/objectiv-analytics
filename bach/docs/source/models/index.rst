.. _models:

.. currentmodule:: modelhub

.. frontmatterposition:: 3

==============
Model overview
==============

The model hub has two main types of functions: `map` and `aggregate`.

- `map` functions always return a series with the same shape and index as the DataFrame they are applied to.
  This ensures they can be added as a column to that DataFrame. `map` functions that return SeriesBoolean can
  be used with to filter the data.
- `aggregate` functions return aggregated data in some form from the DataFrame. Can also be accessed with
  `agg`.


Mapping
-------

.. autosummary::
    :toctree: Mapping

    Map.is_first_session
    Map.is_new_user
    Map.is_conversion_event
    Map.conversions_counter
    Map.conversions_in_time
    Map.pre_conversion_hit_number


Aggregation
-----------

.. autosummary::
    :toctree: Aggregation

    Aggregate.unique_users
    Aggregate.unique_sessions
    Aggregate.session_duration
    Aggregate.frequency
