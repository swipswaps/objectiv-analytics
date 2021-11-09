"""
Copyright 2021 Objectiv B.V.
"""
from sql_models.model import SqlModelBuilder


class FeatureTable(SqlModelBuilder):

    @property
    def sql(self):
        return '''
SELECT DISTINCT feature_hash,
                stack_selection as feature,
                'Pretty' || stack_selection as feature_pretty_name
FROM {{hashed_features}}
'''
