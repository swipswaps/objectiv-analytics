"""
Copyright 2022 Objectiv B.V.
"""

import bach
from sqlalchemy.engine import create_engine
engine = create_engine(
    'bigquery://objectiv-snowplow-test-2/bach_test',
    credentials_path='/home/thijs/.work_secret/objectiv-snowplow-test-2_bach-big-query-testing.json'
)
df = bach.DataFrame.from_table(engine=engine, table_name="cities", index=['skating_order'])

pdf = df.to_pandas()
print(pdf)
