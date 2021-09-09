"""
Copyright 2021 Objectiv B.V.
"""
from sql_models.model import SqlModelBuilder


class ExtractedContexts(SqlModelBuilder):

    @property
    def sql(self):
        return _SQL


_SQL = \
'''
SELECT *,
        value->>'event' AS event,
        JSON_EXTRACT_PATH(value, 'global_contexts') AS global_contexts,
        JSON_EXTRACT_PATH(value, 'location_stack') AS location_stack,
        JSON_EXTRACT_PATH(value, 'time') AS time,
        JSON_EXTRACT_PATH(value, 'events') AS events
 FROM data
 '''
