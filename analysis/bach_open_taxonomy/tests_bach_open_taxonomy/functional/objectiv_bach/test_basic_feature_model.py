from bach_open_taxonomy import basic_feature_model

def test_basic_features():
    basic_feature_model()
import sqlalchemy
import os
from bach import DataFrame
from bach_open_taxonomy import basic_feature_model
from bach_open_taxonomy import ObjectivFrame
dsn = os.environ.get('DSN', 'postgresql://@localhost:5432/postgres')
engine = sqlalchemy.create_engine(dsn, pool_size=1, max_overflow=0)

def test_buh():
    DataFrame.from_table(engine,'data',['event_id'])

def test_buh2():
    ObjectivFrame(engine, 'data')