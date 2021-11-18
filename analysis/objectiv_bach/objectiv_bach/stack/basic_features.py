"""
Copyright 2021 Objectiv B.V.
"""
from sql_models.model import SqlModelBuilder


class BasicFeatures(SqlModelBuilder):

    @property
    def sql(self):
        return '''
SELECT *
FROM {{sessionized_data}} sd
'''
