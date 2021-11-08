from sankey_dash import get_app
from dash import Dash
import sqlalchemy
from bach import DataFrame
from objectiv_bach.series.series_objectiv import FeatureFrame

from objectiv_bach import basic_feature_model

engine = sqlalchemy.create_engine('postgresql://objectiv:@localhost:5432/objectiv')

basic_features = basic_feature_model()
full_df = DataFrame.from_model(engine=engine, model=basic_features, index=['event_id'])
full_df['global_contexts'] = full_df.global_contexts.astype('objectiv_global_context')
full_df['location_stack'] = full_df.location_stack.astype('objectiv_location_stack')
full_df=full_df[full_df.global_contexts.gc.application=='rod-web-demo']
feature_df = FeatureFrame.from_data_frame(df=full_df, location_stack_column='location_stack', event_column='event_type')
app = get_app(Dash, feature_df)

if __name__ == '__main__':
    app.run_server(host='0.0.0.0',port=8051)