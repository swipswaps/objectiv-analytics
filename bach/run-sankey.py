from sankey_dash import get_app
from dash import Dash

import sqlalchemy

engine = sqlalchemy.create_engine('postgresql://@localhost:5432/postgres')

from bach import DataFrame
import sqlalchemy

engine = sqlalchemy.create_engine('postgresql://@localhost:5432/postgres')
import sys

sys.path.extend([
    '../analysis'
])


from bach.series.series_objectiv import FeatureFrame
from bach.series.series_objectiv import SeriesGlobalContexts, SeriesLocationStack
from bach.types import _registry
_registry.register_dtype_series(SeriesGlobalContexts, [], override_registered_types=True)
_registry.register_dtype_series(SeriesLocationStack, [], override_registered_types=True)
full_df = DataFrame.from_table(engine=engine, table_name='basic_bach', index=['event_id'])#[['global_contexts','location_stack']]
full_df['global_contexts'] = full_df.global_contexts.astype('objectiv_global_context')
full_df['location_stack'] = full_df.location_stack.astype('objectiv_location_stack')
full_df=full_df[full_df.global_contexts.gc.application=='rod-web-demo']
a = FeatureFrame.from_data_frame(bt=full_df, location_stack_column='location_stack', event_column='event_type')
a['b'] = a['location_stack'].json[1:]
app = get_app(Dash, a)



if __name__ == '__main__':
    # app.run_server(debug=True)
    app.run_server(debug=True, host='0.0.0.0',port=8054)