"""
Copyright 2021 Objectiv B.V.
"""
from sql_models.model import SqlModelBuilder


class HashedFeatures(SqlModelBuilder):

    @property
    def sql(self):
        return _SQL


_SQL = \
'''
WITH selected_stacks_{{id}} AS
(
SELECT   event_id,
         Array_to_string(Array_agg(Cast(x AS TEXT)),',') AS stack_selection,
         Array_to_json(Array_agg(Row_to_json(x))) as selected_stack_location
FROM     {{extracted_contexts}},
         json_to_recordset(location_stack) AS x(_type text,id text)
GROUP BY event_id
ORDER BY event_id
)
SELECT *,
       md5(concat(stack_selection,event_type)) as feature_hash
FROM {{extracted_contexts}}
JOIN selected_stacks_{{id}} USING (event_id)
'''
