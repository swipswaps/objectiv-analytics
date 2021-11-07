"""
Copyright 2021 Objectiv B.V.
"""
from sql_models.model import SqlModelBuilder


class BasicFeatures(SqlModelBuilder):

    @property
    def sql(self):
        return '''
SELECT 
  data.*, 
  bm.feature
FROM {{sessionized_data}} as data
JOIN {{feature_table}} bm USING (feature_hash)
'''
