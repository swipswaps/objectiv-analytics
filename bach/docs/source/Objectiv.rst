=================
Objectiv ModelHub
=================

.. currentmodule:: modelhub

Objectiv data as it's stored in an sql data base can be analyzed in a python environment using the libraries
specifically created for these purpose: the Bach and the model hub.

- With Bach, the data can be analyzed using a pandas inspired interface.
- With the model hub, most standard product analytics models can be performed on the data without much
  configuration. In the background it runs on Bach, but in most cases models can be run with just a single line
  of code.

Model overview
--------------

Mapping
~~~~~~~
.. autosummary::
    :toctree: Objectiv

    Map.is_first_session
    Map.is_new_user
    Map.is_conversion_event
    Map.conversions_counter
    Map.conversions_in_time
    Map.pre_conversion_hit_number

Aggregation
~~~~~~~~~~~
.. autosummary::
    :toctree: Objectiv

    Aggregate.unique_users
    Aggregate.unique_sessions
    Aggregate.session_duration
    Aggregate.frequency

Reference
---------
.. autosummary::
    :template: autosummary/class_short.rst
    :toctree: Objectiv

    ModelHub
    SeriesGlobalContexts
    SeriesLocationStack

