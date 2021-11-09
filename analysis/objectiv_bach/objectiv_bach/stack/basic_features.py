"""
Copyright 2021 Objectiv B.V.
"""
from bach.sql_model import BachSqlModel


class BasicFeatures(BachSqlModel):

    @property
    def sql(self):
        return '''
SELECT
  data.*,
  bm.feature,
  bm.feature_pretty_name
FROM {{sessionized_data}} as data
JOIN {{feature_table}} bm USING (feature_hash)
'''
