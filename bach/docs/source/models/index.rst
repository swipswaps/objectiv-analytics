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


Map
---

.. currentmodule:: modelhub.Map

.. autosummary::
    :toctree: Mapping

    is_first_session
    is_new_user
    is_conversion_event
    conversions_counter
    conversions_in_time
    pre_conversion_hit_number


.. toctree::
    :hidden:

    Mapping/index


.. currentmodule:: modelhub.Aggregate

Aggregate
---------

.. autosummary::
    :toctree: Aggregation

    unique_users
    unique_sessions
    session_duration
    frequency


.. toctree::
    :hidden:

    Aggregation/index
