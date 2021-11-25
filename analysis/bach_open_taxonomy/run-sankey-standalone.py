from dash import Dash
import sqlalchemy
import os
from bach import DataFrame
from bach_open_taxonomy import FeatureFrame, basic_feature_model
from bach_open_taxonomy.sankey_dash import get_app

dsn = os.environ.get('DSN', 'postgresql://objectiv:@localhost:5432/objectiv')
engine = sqlalchemy.create_engine(dsn, pool_size=1, max_overflow=0)

basic_features = basic_feature_model()

full_df = DataFrame.from_model(engine=engine, model=basic_features, index=['event_id'])
full_df['global_contexts'] = full_df.global_contexts.astype('objectiv_global_context')
full_df['location_stack'] = full_df.location_stack.astype('objectiv_location_stack')

df = full_df[full_df.global_contexts.gc.application == 'objectiv-website']
feature_df = FeatureFrame.from_data_frame(df=df, location_stack_column='location_stack',
                                          event_column='event_type')
app = get_app(Dash, feature_df)

if __name__ == '__main__':
    app.run_server(host='0.0.0.0', port=8051, debug=True)
