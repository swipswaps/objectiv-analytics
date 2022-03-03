.. currentmodule:: bach

================
Bach and sklearn
================

With Objectiv you can do all your analysis and Machine Learning directly on the raw data in your sql store.
This example shows in the simplest way possible how you can use Objectiv to create a basic feature set and use
sklearn to do machine learning on this data set.

At first we have to instantiate the 'Objectiv Frame' object. This points to the data and all operations are
done on this object.

.. code-block:: python

    from bach_open_taxonomy import ObjectivFrame
    of = ObjectivFrame.from_objectiv_data(start_date='2022-01-04',time_aggregation='YYYY-MM-DD')

This object points to all data in the data set. Too large to run in pandas and therefore sklearn. For the
data set that we need, we aggregate to user level, at which point it is small enough to fit in memory.

We create a data set of per user all the root locations that the user clicked on.

.. code-block:: python

    # extract the root location from the location stack
    of['root'] = of.location_stack.ls.get_from_context_with_type_series(type='RootLocationContext', key='id')
    # only look at press events and count the root locations
    features = features = of[(of.event_type=='PressEvent')].groupby('user_id').root.value_counts()
    # unstack the series, to create a DataFrame with the number of clicks per root location as columns
    features_unstacked = features.unstack(fill_value=0)

Now we have a basic feature set that is small enough to fit in memory. This can be used with sklearn, as we
demonstrate in this example.

.. code-block:: python

    from sklearn import cluster

    # export to pandas now
    df = features_unstacked.to_pandas()

    # do the clustering using the pandas DataFrame and set the labels as a column to that DataFrame
    est = cluster.KMeans(n_clusters=3)
    est.fit(df)
    df['cluster'] = est.labels_

Now you can use the created clusters on your entire data set again if you add it back to your ObjectivFrame.
This is simple, as Bach and pandas are cooperating nicely. Your original Objectiv data now has a 'cluster'
column.

.. code-block:: python

    kfeatures_unstacked['cluster'] = df['cluster']
    of_with_cluster_results = of.merge(features_unstacked[['cluster']], on='user_id')

You can use this column, just as any other. For example you can now use your created clusters to group models
from the model hub by:

.. code-block:: python

    of_with_cluster.mh.agg.session_duration(groupby='cluster').head()
    # Expected output:
    # cluster
    # 0   0 days 00:09:18.204353
    # 1   0 days 00:10:25.104636
    # 2   0 days 00:20:43.561232
    # Name: session_duration, dtype: timedelta64[ns]
