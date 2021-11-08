from sankey_dash import get_app
from dash import Dash
import sqlalchemy
from bach import DataFrame
from bach.series.series_objectiv import SeriesGlobalContexts, SeriesLocationStack, FeatureFrame
from bach.types import _registry
import sys
sys.path.extend([
    '../analysis'
])
from objectiv_bach.util import duplo_basic_features

engine = sqlalchemy.create_engine('postgresql://objectiv:@localhost:5432/objectiv')

_registry.register_dtype_series(SeriesGlobalContexts, [], override_registered_types=True)
_registry.register_dtype_series(SeriesLocationStack, [], override_registered_types=True)
basic_features = duplo_basic_features()
full_df = DataFrame.from_model(engine=engine, model=basic_features, index=['event_id'])
full_df['global_contexts'] = full_df.global_contexts.astype('objectiv_global_context')
full_df['location_stack'] = full_df.location_stack.astype('objectiv_location_stack')
full_df=full_df[full_df.global_contexts.gc.application=='rod-web-demo']
feature_df = FeatureFrame.from_data_frame(df=full_df, location_stack_column='location_stack', event_column='event_type')
app = get_app(Dash, feature_df)

if __name__ == '__main__':
    app.run_server(host='0.0.0.0',port=8051)