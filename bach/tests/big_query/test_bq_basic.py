"""
Copyright 2022 Objectiv B.V.
"""
import time

import bach
from sqlalchemy.engine import create_engine


def test_basic():
    df = get_df_with_test_data()
    pdf = df.to_pandas()
    print(pdf)
    print(df.dtypes)


def get_df_with_test_data():
    t1 = time.perf_counter()
    engine = create_engine(
        'bigquery://objectiv-snowplow-test-2/bach_test',
        credentials_path='/home/thijs/.work_secret/objectiv-snowplow-test-2_bach-big-query-testing.json'
    )
    t2 = time.perf_counter()
    df = bach.DataFrame.from_table(engine=engine, table_name="cities", index=['skating_order'])
    t3 = time.perf_counter()
    print(f'{t2-t1}, {t3-t2}')
    return df
