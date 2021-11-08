"""
Copyright 2021 Objectiv B.V.
"""
from bach.series import SeriesJsonb, SeriesString
from bach.expression import Expression, quote_string, quote_identifier
from bach.sql_model import BachSqlModel
from bach import DataFrame


class ObjectivStack(SeriesJsonb.Json):
    def get_from_context_with_type_series(self, type, key, dtype='string'):
        expression_str = f'''
        jsonb_path_query_first({{}},
        \'$[*] ? (@._type == $type)\',
        \'{{"type":{quote_identifier(type)}}}\') ->> {{}}'''
        expression = Expression.construct(
            expression_str,
            self._series_object,
            Expression.string_value(key)
        )
        return self._series_object.copy_override(dtype=dtype, expression=expression)


class SeriesGlobalContexts(SeriesJsonb):
    """
    Objectiv Global Contexts series. This series type contains functionality specific to the Objectiv Global
    Contexts.
    """
    dtype = 'objectiv_global_context'
    return_dtype = dtype

    class GlobalContexts(ObjectivStack):
        @property
        def cookie_id(self):
            return self.get_from_context_with_type_series("CookieIdContext", "cookie_id")

        @property
        def user_agent(self):
            return self.get_from_context_with_type_series("HttpContext", "user_agent")

        @property
        def application(self):
            return self.get_from_context_with_type_series("ApplicationContext", "id")

    @property
    def objectiv(self):
        return ObjectivStack(self)

    @property
    def obj(self):
        return ObjectivStack(self)

    @property
    def global_contexts(self):
        return self.GlobalContexts(self)

    @property
    def gc(self):
        return self.GlobalContexts(self)


class SeriesLocationStack(SeriesJsonb):
    """
    Objectiv Location Stack series. This series type contains functionality specific to the Objectiv Location
    Stack.
    """
    dtype = 'objectiv_location_stack'
    return_dtype = dtype

    class LocationStack(ObjectivStack):
        @property
        def navigation_features(self):
            return self[{'_type': 'NavigationContext'}: None]

        @property
        def feature_stack(self):
            keys = ['_type', 'id', 'url']
            jsonb_build_object_str = [f"{quote_string(key)}" for key in keys]
            expression_str = f'''(
                select jsonb_agg((
                    select json_object_agg(items.key, items.value)
                    from jsonb_each(objects.value) as items
                    where items.key in ({", ".join(jsonb_build_object_str)})))
                from jsonb_array_elements({{}}) as objects)
            '''
            expression = Expression.construct(
                expression_str,
                self._series_object
            )
            return self._series_object.copy_override(dtype='objectiv_location_stack', expression=expression)

        @property
        def nice_name(self):
            expression = Expression.construct(
                f"""(
                select array_to_string(
                    array_agg(
                        replace(
                            regexp_replace(value ->> '_type', '([a-z])([A-Z])', '\\1 \\2', 'g'),
                        ' Context', '') || ': ' || (value ->> 'id')
                    ),
                ' => ')
                from jsonb_array_elements({{}}) with ordinality
                where ordinality = jsonb_array_length({{}})) || case
                    when jsonb_array_length({{}}) > 1
                        then ' located at ' || (select array_to_string(
                    array_agg(
                        replace(
                            regexp_replace(value ->> '_type', '([a-z])([A-Z])', '\\1 \\2', 'g'),
                        ' Context', '') || ': ' || (value ->> 'id')
                    ),
                ' => ')
                from jsonb_array_elements({{}}) with ordinality
                where ordinality < jsonb_array_length({{}})
                ) else '' end""",
                self._series_object,
                self._series_object,
                self._series_object,
                self._series_object,
                self._series_object
            )
            return self._series_object.copy_override(dtype='string', expression=expression)

    @property
    def objectiv(self):
        return ObjectivStack(self)

    @property
    def obj(self):
        return ObjectivStack(self)

    @property
    def location_stack(self):
        return self.LocationStack(self)

    @property
    def ls(self):
        return self.LocationStack(self)


class FeatureFrame(DataFrame):
    """
    class that is based on Bach DataFrame. It shares basic functionality with Bach DataFrame, but it is
    solely focussed on feature creation. It allows you to create features on a small dataset and write them
    to the entire dataset when done.
    """

    def __init__(
            self,
            engine,
            base_node,
            index,
            series,
            group_by,
            order_by,
            original_df,
            location_stack_column,
            event_column):
        self._original_df = original_df
        self.location_stack_column = location_stack_column
        self.event_column = event_column
        super().__init__(engine=engine,
                         base_node=base_node,
                         index=index,
                         series=series,
                         group_by=group_by,
                         order_by=order_by)

    @classmethod
    def from_data_frame(cls, df, location_stack_column, event_column, temp_table_name='tmp_feature_data'):
        event_series, location_stack_series = cls.check_supported(df, location_stack_column, event_column)

        feature_df = location_stack_series.to_frame()
        feature_df[event_column] = event_series
        feature_df['feature_hash'] = cls.hash_features(feature_df, location_stack_column, event_column)

        window = feature_df.window(feature_df['feature_hash'])
        feature_df['event_count'] = feature_df['feature_hash'].count(window)
        feature_df['event_number'] = feature_df['feature_hash'].window_row_number(window)

        feature_df = feature_df.materialize('features')

        feature_df = feature_df[feature_df.event_number == 1][[location_stack_column,
                                                               event_column,
                                                               'feature_hash',
                                                               'event_count']]

        sql = f'''
            create temporary table {temp_table_name} AS
            ({feature_df.view_sql()})
        '''
        with feature_df.engine.connect() as conn:
            conn.execute(sql)

        feature_df = feature_df.set_index('feature_hash')

        new_base_node = BachSqlModel(sql=f'select * from {temp_table_name}').instantiate()
        new_index = {key: value.dtype for key, value in feature_df.index.items()}
        new_data = {key: value.dtype for key, value in feature_df._data.items()}

        feature_df_new = DataFrame.get_instance(feature_df.engine,
                                                base_node=new_base_node,
                                                index_dtypes=new_index,
                                                dtypes=new_data,
                                                group_by=None)

        return FeatureFrame(engine=feature_df_new.engine,
                            base_node=feature_df_new.base_node,
                            index=feature_df_new.index,
                            series=feature_df_new._data,
                            group_by=None,
                            order_by=None,
                            original_df=df,
                            location_stack_column=location_stack_column,
                            event_column=event_column)

    @staticmethod
    def check_supported(df, location_stack_column, event_column):
        if not isinstance(df[event_column], SeriesString):
            raise TypeError('only string supported for event column')
        if isinstance(df[location_stack_column], SeriesLocationStack):
            location_stack_series = df[location_stack_column]
        elif isinstance(df[location_stack_column], SeriesJsonb):
            location_stack_series = df[location_stack_column].astype('objectiv_location_stack')
        else:
            raise TypeError('only jsonb type supported for location column')

        return df[event_column], location_stack_series.ls.feature_stack

    @classmethod
    def hash_features(cls, df, location_stack_column, event_column):
        event_series, location_stack_series = cls.check_supported(df, location_stack_column, event_column)
        expression_str = "md5(concat({} #>> {}, {}))"
        expression = Expression.construct(
            expression_str,
            location_stack_series,
            Expression.string_value('{}'),
            event_series
        )
        return location_stack_series.copy_override(dtype='string', expression=expression)

    def write_to_full_frame(self):
        created_features = [x for x in self.data_columns if x not in [self.location_stack_column,
                                                                      self.event_column,
                                                                      'event_count']]

        feature_hash = self.hash_features(self._original_df,
                                          self.location_stack_column,
                                          self.event_column)

        self._original_df['feature_hash'] = feature_hash

        return self._original_df.merge(self[created_features], left_on='feature_hash', right_index=True)

    def stack_flows_from_feature_df(self,
                                    stack_column: str = None,
                                    count_method: str = 'sum'):
        """
        Function that calculates the links between contexts on the
        stack. It returns a DataFrame with the links 'from' and 'to'
        contexts. Optionally, the method that determines the 'strength'
        of the links can be deteermined with 'to_count' and 'count_method'

        Parameters
        ----------
        df : DataFrame
            The DataFrame that contains a stack.

        feature_column : str
            The column that contains the stack for which the links
            will be calculated.

        to_count : str
            This columns on which the count_method will be applied.

        count_method : str
            The function for aggregating the data.
        """
        import pandas as pd
        df = self.to_pandas()
        if stack_column is None:
            stack_column = self.location_stack_column
        contexts = df[stack_column].map(lambda x: [[a, y] for a, y in enumerate(x)]).explode()
        contexts.dropna(inplace=True)
        sankey_prep = df.join(pd.DataFrame(contexts.to_list(),
                                           index=contexts.index,
                                           columns=['context_index', 'context'])
                              ).reset_index()

        sankey_prep = sankey_prep[['feature_hash', 'context_index', 'context', 'event_count']].sort_values(
            'context_index', ascending=False)
        sankey_prep['source'] = sankey_prep.context.map(repr).astype('str')
        sankey_prep['target'] = sankey_prep.groupby('feature_hash')['source'].shift(1,
                                                                                    fill_value='end_of_stack')
        sankey_prep_agg = sankey_prep.groupby(['source', 'target'])['event_count'].agg(
            count_method).reset_index().rename(columns={'event_count': 'value'})
        categories = set(sankey_prep_agg['source']).union(set(sankey_prep_agg['target']))
        sankey_prep_agg['source'] = pd.Categorical(sankey_prep_agg['source'], categories=categories)
        sankey_prep_agg['target'] = pd.Categorical(sankey_prep_agg['target'], categories=categories)

        return sankey_prep_agg

    def display_sankey(self,
                       stack_column: str = None,
                       text_in_title: str = None,
                       node_color='blue'):
        """
        Display the Sankey chart using some standards to be
        reused in the Sankey app.

        Parameters
        ----------
        df : DataFrame
            The to graph. This needs to be in the format as specified
            by the stack_flows_from_feature_df function.

        text_in_title : str
            A text to display in the title of the graph.

        node_color : str
            Optionally the color of the nodes can be adjusted.
        """
        import pandas as pd
        import plotly.graph_objects as go  # type: ignore
        if text_in_title is not None:
            text_in_title = str(text_in_title)

        if stack_column is None:
            stack_column = self.location_stack_column
        df = self.stack_flows_from_feature_df(stack_column)
        node = dict(
            pad=15,
            thickness=20,
            line=dict(color="black", width=0.5),
            label=df.source.cat.categories,
            color=node_color
        )
        link = pd.concat([df[['source', 'target']].apply(lambda x: x.cat.codes), df['value']],
                         axis=1).to_dict('list')
        fig = go.Figure(go.Sankey(arrangement="fixed", link=link, node=node), {'clickmode': 'event+select'})
        fig.update_layout(title_text=text_in_title, font_size=10)

        return fig

    def copy_override(self,
                      engine=None,
                      base_node=None,
                      index=None,
                      series=None,
                      group_by=None,
                      order_by=None,
                      index_dtypes=None,
                      series_dtypes=None,
                      single_value=None,
                      **kwargs
                      ):
        print('afadgfs')
        print(kwargs)
        return super().copy_override(engine=engine,
                                     base_node=base_node,
                                     index=index,
                                     series=series,
                                     group_by=group_by,
                                     order_by=order_by,
                                     index_dtypes=index_dtypes,
                                     series_dtypes=series_dtypes,
                                     single_value=single_value,
                                     original_df=self._original_df,
                                     location_stack_column=self.location_stack_column,
                                     event_column=self.event_column,
                                     **kwargs)
