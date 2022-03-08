.. currentmodule:: bach_open_taxonomy

===========================
Product analytics with Bach
===========================

This example shows how Bach can be used for basic product analysis.

This example is also available in a `notebook
<https://github.com/objectiv/objectiv-analytics/blob/main/analysis/notebooks/basic-analysis.ipynb>`_
to run on your own data or use our
`quickstart
<https://objectiv.io/docs/home/quickstart-guide/>`_ to try it out with demo data in 5 minutes.

At first we have to instantiate the 'Objectiv Frame' object. See `Getting started with Objectiv
<getting_started.html>`_ for more info on how to instantiate the object. The data used in this example is
based on the data set that comes with our quickstart docker demo.

First we look at the data.

.. code-block:: python

    of.sort_values('session_id', ascending=False).head()

The columns 'global_contexts' and the 'location_stack' contain most of the event specific data. These columns
are json type columns and we can extract data from it based on the keys of the json objects using
`get_from_context_with_type_series
<Objectiv/bach_open_taxonomy.SeriesGlobalContexts.objectiv.html>`_. Or use methods
specific to the `location stack
<Objectiv/bach_open_taxonomy.SeriesLocationStack.ls.html>`_ or `global contexts
<Objectiv/bach_open_taxonomy.SeriesGlobalContexts.gc.html>`_ to extract the data.

:py:attr:`bach_open_taxonomy.SeriesGlobalContexts.global_contexts`

.. code-block:: python

    of['application'] = of.global_contexts.gc.application
    of['feature_nice_name'] = of.location_stack.ls.nice_name
    of['root_location'] = of.location_stack.ls.get_from_context_with_type_series(type='RootLocationContext', key='id')
    of['referrer'] = of.global_contexts.gc.get_from_context_with_type_series(type='HttpContext', key='referrer')

Now we will go though a bunch of basic analytics metrics. We can use models from the `model hub
<Objectiv/bach_open_taxonomy.ModelHub.html>`_ for this purpose
or use `Bach
<reference.html>`_ to do data analysis directly on the data stored in the sql data base using pandas like syntax.

For each example, `head()`, `to_pandas()` or `to_numpy()` can be used to execute the generated sql and get the results in
your notebook.

How many users do we have?
--------------------------
The `daily_users` uses the `time_aggregation` as set when the `of` object was instantiated. In this case the
formatting was set to days, so the aggregation is daily. For `monthly_users`, the default time_aggregation is
overridden by using a different `groupby`.

.. code-block:: python

    daily_users = of.model_hub.aggregate.unique_users()
    montly_users = of.model_hub.aggregate.unique_users(groupby=of.mh.time_agg('YYYY-MM'))
    users_root = of.model_hub.aggregate.unique_users(groupby=['application', 'root_location'])

What is their time spent?
-------------------------
Similarly we can calculate the average session duration for time intervals. `duration_root_month` gives the
average time spent per root location per month.

.. code-block:: python

    duration_daily = of.model_hub.aggregate.session_duration()
    duration_monthly = of.model_hub.aggregate.session_duration(groupby=of.mh.time_agg('YYYY-MM'))
    duration_root_month = of.model_hub.aggregate.session_duration(groupby=['root_location',of.mh.time_agg('YYYY-MM')])

This example shows the quartiles of time spent. Materialization is needed because the expression of the
created series contains aggregated data, and it is not allowed to aggregate that.

.. code-block:: python

    session_duration = of.mh.aggregate.session_duration(groupby='session_id', exclude_bounces=False)
    session_duration.to_frame().materialize()['session_duration'].quantile(q=[0.25, 0.50, 0.75]).head()

What are the top user interactions?
-----------------------------------

.. code-block:: python

    # select only user actions, so stack_event_types must be a superset of ['InteractiveEvent']
    users_feature = of[of.stack_event_types>=['InteractiveEvent']]

    # users by feature
    users_feature = users_feature.groupby(['application', 'feature_nice_name', 'event_type']).agg({'user_id':'nunique'})
    users_feature.sort_values('user_id_nunique', ascending=False).head()

What users do in each of the main product areas?
------------------------------------------------

First we use the model hub to get the unique users per application, root location, feature, and event type.
From this prepared dataset, we get show the users for the home page first.

.. code-block:: python

    most_interactions = interactive_events.mh.agg.unique_users(groupby=['application','root_location','feature_nice_name', 'event_type'])
    most_interactions = most_interactions.to_frame().reset_index()

    home_users = most_interactions[(most_interactions.application == 'objectiv-website') &
                                   (most_interactions.root_location == 'home')]
    home_users.sort_values('unique_users', ascending=False).head()

From the same `most_interactions` object, we can select the top interactions for the 'docs' page.

.. code-block:: python

    docs_users = most_interactions[most_interactions.application == 'objectiv-docs']
    docs_users.sort_values('unique_users', ascending=False).head()

Where are users coming from?
----------------------------

.. code-block:: python

    # users by referrer
    of.mh.agg.unique_users(groupby='referrer').sort_values(ascending=False).head()

How are conversions doing?
--------------------------
First we define a conversion event in the Objectiv Frame.

.. code-block:: python

    of.add_conversion_event(location_stack=of.location_stack.json[{'id': 'objectiv-on-github',
                                                                   '_type': 'LinkContext'}:].fillna(
                                           of.location_stack.json[{'id': 'github', '_type': 'LinkContext'}:]),
                            event_type='PressEvent',
                            name='github_press')

This can be used by several models from the model hub using the defined name ('github_press'). First we calculate
the number of unique converted users.

.. code-block:: python

    conversions = of.model_hub.filter(of.model_hub.map.is_conversion_event('github_press'))\
                    .model_hub.aggregate.unique_users()

We use the earlier created `daily_users` to calculate the daily conversion rate.

.. code-block:: python

    conversion_rate = conversions / daily_users

From where do users convert most?

.. code-block:: python

    conversion_locations = of.model_hub.filter(of.model_hub.map.is_conversion_event('github_press'))\
                             .model_hub.agg.unique_users(groupby=['application', 'feature_nice_name', 'event_type'])


We can calculate what users did _before_ converting by combining several models from the model hub.

.. code-block:: python

    # select sessions with a conversion
    converted_users = of.model_hub.filter(of.model_hub.map.conversions_counter(name='github_press')>=1)

    # from those, select hits where number of conversions was still 0
    converted_users = converted_users.mh.filter(converted_users.model_hub.map.conversions_in_time('github_press')==0)

    # select only user interactions
    converted_users_filtered = converted_users[converted_users.stack_event_types>=['InteractiveEvent']]

    converted_users_features = converted_users_filtered.model_hub.agg.unique_users(groupby=['application',
                                                                                            'feature_nice_name',
                                                                                            'event_type'])

At last we want to know how much time users that converted spent on our site before they converted. For this
we recylcle the object we created above.

.. code-block:: python

    converted_users.model_hub.aggregate.session_duration(groupby=None).to_frame().head()
