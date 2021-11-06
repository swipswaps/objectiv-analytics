import json 
from textwrap import dedent as d
import dash_core_components as dcc
import dash_html_components as html
from dash.dependencies import Input, Output, State
from dash import callback_context
import plotly.graph_objects as go
import pandas as pd

def get_app(Dash, feature_frame, start_event_dropdown_option='all', start_stack_dropdown_option='location_stack'):


    external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']
    
    event_dropdown_options = [{'label': i, 'value': i} for i in set(feature_frame[feature_frame.event_column].values)]
    event_dropdown_options.append({'label': 'all', 'value': 'all'})

    features = [key for key, value in feature_frame._bt.dtypes.items() if value == 'objectiv_location_stack']

    stack_dropdown_options = [{'label': i, 'value': i} for i in features]

    # stack_dropdown_options.append({'label': 'location_stack', 'value': 'location_stack'})


    app = Dash(__name__, external_stylesheets=external_stylesheets)

    styles = {
        'pre': {
            'border': 'thin lightgrey solid',
            'overflowX': 'scroll'
        }
    }




    def serve_layout():
        return html.Div([
            dcc.Store(id='node-clicks', data=[]),
            dcc.Dropdown(id='event', options=event_dropdown_options, value='all'),
            dcc.Dropdown(id='stack', options=stack_dropdown_options, value='location_stack'),
            html.Label('Slice:'),
            dcc.Input(id='start-at', type='number', min=0, step=1),
            dcc.Input(id='end-at', type='number', step=1),
            html.Br(),
            dcc.Input(id='feature-name', type='text', placeholder='Feature name'),
            html.Button('Create feature', id='create-feature', n_clicks=0),
            html.Br(),
            html.Button('Reset feature rules', id='reset-feature-rules', n_clicks=0),
            dcc.Graph(id='top-graph'),
            dcc.Markdown(d("**Feature rules**")),
            html.Pre(id='feature-rules', style=styles['pre']),
            dcc.Markdown(d("**Console**")),
            html.Pre(id='console', style=styles['pre'])
        ])


    app.layout = serve_layout


    @app.callback(
        Output('top-graph', 'figure'),
        [Input('node-clicks', 'data'),
         Input('event', 'value'),
         Input('stack', 'value'),
         Input('start-at', 'value'),
         Input('end-at', 'value')])
    def draw_top_graph(node_clicks_data, event_value, stack_value, start_at_value, end_at_value):
        """
        Displays the upper Sankey diagram based on inputs from the app.

        Parameters
        ----------
        node_clicks_data : List[dict]
            A collection of the clicked nodes. These are used for feature 
            creation as specified by apply_stored_rules.

        event_value : str
            The stack for which the Sankey is drawn.

        stack_value : str
            The column that contains the stack that is used for the 
            filter on valid stacks.

        start_at_value : int
            Optionally a starting position of the feature can be 
            specified. This rule will always be applied after all
            the rules in nodes have been applied.
            The function for aggregating the data.

        end_at_value : int
            See start_at_value. This will be applied together 
            with start_at_value.
        """

        feature_frame['_sankey_feature'] = feature_frame[stack_value]
        if len(node_clicks_data) > 0:
            for x in node_clicks_data:
                feature_frame['_sankey_feature'] = feature_frame[stack_value].json[x:]
        if start_at_value is not None or end_at_value is not None:
            feature_frame['_sankey_feature'] = feature_frame['_sankey_feature'].json[start_at_value:end_at_value]
        filtered_feature_frame = feature_frame[feature_frame['_sankey_feature'].notnull()]
        if event_value == 'all':
            return filtered_feature_frame.display_sankey('_sankey_feature')
        else:
            return filtered_feature_frame[filtered_feature_frame[filtered_feature_frame.event_column]==event_value].display_sankey('_sankey_feature')

    @app.callback(
        Output('feature-rules', 'children'),
        [Input('node-clicks', 'data'),
         Input('start-at', 'value'),
         Input('end-at', 'value')])
    def display_feature_rule_real(node_clicks_data, start_at_value, end_at_value):
        feature_rules = [f'.json[{x}:]' for x in node_clicks_data]
        if not (start_at_value is None and end_at_value is None):
            feature_rules.append(f'.json[{start_at_value}:{end_at_value}]')

        return '\\\n'.join(feature_rules)

    @app.callback(
        [Output('stack', 'options'),
         Output('console', 'children')],
        Input('create-feature', 'n_clicks'),
        [State('node-clicks', 'data'),
         State('stack', 'value'),
         State('start-at', 'value'),
         State('end-at', 'value'),
         State('feature-name', 'value')])
    def create_feature(
            create_feature_n_clicks,
            node_clicks_data,
            stack_value,
            start_at_value,
            end_at_value,
            feature_name_value):
        """
        Creates a feature based clicks in the top graph, slice and
        name.

        Parameters
        ----------
        create_feature_n_clicks : int
            Current number of clicks on the Create Feature button.

        node_clicks_data : List[dict]
            Each element in the list contains the name of the node
            that will be used to create a feature. Each clicked node
            will be the start of a feature.

        feature_name_value : str
            The name of the feature that will be used once a feature is
            created.

        start_at_value : int
            Optionally a starting position of the feature can be
            specified. This rule will always be applied after all
            the rules in nodes have been applied.
            The function for aggregating the data.

        end_at_value : int
            See start_at_value. This will be applied together
            with start_at_value.

        """
        console_text = ''
        prop_id_triggered = callback_context.triggered[0]['prop_id']
        if prop_id_triggered == 'create-feature.n_clicks':
            feature_frame[feature_name_value] = feature_frame[stack_value]
            if len(node_clicks_data) > 0:
                for x in node_clicks_data:
                    feature_frame[feature_name_value] = feature_frame[stack_value].json[x:]
            if start_at_value is not None or end_at_value is not None:
                feature_frame[feature_name_value] = feature_frame[feature_name_value].json[start_at_value:end_at_value]

            if not feature_name_value in [x['label'] for x in stack_dropdown_options]:
                stack_dropdown_options.append({'label': feature_name_value, 'value': feature_name_value})
            console_text = f'feature {feature_name_value} created'

        return stack_dropdown_options, console_text






    @app.callback(
        Output('node-clicks', 'data'),
        [Input('top-graph', 'clickData'),
         Input('reset-feature-rules', 'n_clicks')],
        State('node-clicks', 'data'))
    def set_node_clicks_data(
            top_graph_click_data,
            reset_feature_rules_n_clicks,
            node_clicks_data):
        """
        Stores or resets all nodes clicked in the top graph.

        Parameters
        ----------
        top_graph_click_data : dict
            The click data in the upper graph. If this is a Node it will
            add the data to 'stored-node-data'

        reset_feature_rules_n_clicks : int
            Current number of clicks on the Reset Feature Rules button.

        node_clicks_data : List[dict]
            Each element in the list contains the name of the node
            that will be used to create a feature. Each clicked node
            will be the start of a feature.
        """

        prop_id_triggered = callback_context.triggered[0]['prop_id']

        if prop_id_triggered == 'top-graph.clickData':  # store only if valid node


            import ast
            dict_clicked = ast.literal_eval(top_graph_click_data['points'][0]['label'])

            node_clicks_data.append(dict_clicked)

        if prop_id_triggered == 'reset-feature-rules.n_clicks':
            node_clicks_data = []

        return node_clicks_data

    return app
