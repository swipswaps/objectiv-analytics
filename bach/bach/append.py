from copy import copy
from dataclasses import dataclass
from typing import Tuple, Dict, Hashable, List

from bach import DataFrame, SeriesString
from bach.expression import Expression, join_expressions
from bach.sql_model import BachSqlModel, construct_references, get_variable_values_sql, filter_variables
from sql_models.model import CustomSqlModelBuilder, Materialization


@dataclass
class AppendOperation:
    caller_df: DataFrame
    other_df: DataFrame
    ignore_index: bool = False
    sort: bool = False

    def append(self) -> DataFrame:
        caller_df = self._fill_missing_series(df=self.caller_df, reference_df=self.other_df)
        other_df = self._fill_missing_series(df=self.other_df, reference_df=self.caller_df, cast_types=True)
        if self.ignore_index:
            caller_df = caller_df.reset_index(drop=True)
            other_df = other_df.reset_index(drop=True)

        appended_indexes = self._get_indexes()
        appended_series = self._get_series()

        all_column_names = tuple(list(appended_indexes.keys()) + list(appended_series.keys()))
        caller_columns_expr = self._get_columns_expression(all_column_names, caller_df)
        other_columns_expr = self._get_columns_expression(all_column_names, other_df)

        variables = copy(caller_df.variables)
        variables.update(other_df.variables)

        model = AppendSqlModel(
            column_names=all_column_names,
            caller_columns_expr=caller_columns_expr,
            other_columns_expr=other_columns_expr,
            caller_node=caller_df.base_node,
            other_node=other_df.base_node,
            variables=variables,  # type: ignore
        )

        appended_df = caller_df.copy_override(
            engine=caller_df.engine,
            base_node=model,
            index_dtypes=appended_indexes,
            series_dtypes=appended_series,
            savepoints=caller_df.savepoints.merge(other_df.savepoints),
            variables=variables,
        )
        return self._transform_index(appended_df)

    @staticmethod
    def _get_columns_expression(
        ordered_series_names: Tuple[str, ...], df: DataFrame,
    ) -> Expression:
        return join_expressions(
            [
                Expression.construct_expr_as_name(expr=df.all_series[col].expression, name=col)
                for col in ordered_series_names if col in df.all_series
            ]
        )

    def _get_indexes(self) -> Dict[str, str]:
        if self.ignore_index:
            return {}

        indexes = {idx: self.caller_df.index[idx].dtype for idx in self.caller_df.index_columns}
        indexes.update(
            {
                idx: self.other_df.index[idx].dtype
                for idx in self.other_df.index_columns
                if idx not in indexes
            }
        )
        return indexes

    def _get_series(self) -> Dict[str, str]:
        final_series = {series_name: self.caller_df[series_name].dtype for series_name in self.caller_df.data_columns}
        final_series.update(
            {
                series_name: self.other_df[series_name].dtype
                for series_name in self.other_df.data_columns
                if series_name not in final_series
            }
        )
        if self.sort:
            return {s: final_series[s] for s in sorted(final_series)}
        return final_series

    def _fill_missing_series(
        self, df: DataFrame, reference_df: DataFrame, cast_types: bool = False,
    ) -> DataFrame:
        df_cp = df.copy_override()
        fill_w_series = reference_df.data if self.ignore_index else reference_df.all_series
        for name, series in fill_w_series.items():
            if name not in df_cp.all_series:
                df_cp[name] = None
                df_cp[name] = df_cp[name].astype(series.dtype)
            elif cast_types and df_cp.all_series[name].dtype != series.dtype:
                df_cp.all_series[name] = df_cp.all_series[name].astype(series.dtype)

        return df_cp

    def _transform_index(self, appended_df: DataFrame) -> DataFrame:
        if self.ignore_index or len(appended_df.index) == 1:
            return appended_df

        all_index_dtypes = set(appended_df.index_dtypes.values())

        concat_index_str = ",".join(["{}"] * len(appended_df.index))

        new_index_expr = Expression.construct(
            f"concat_ws('/', {concat_index_str})", *appended_df.index.values(),
        )
        appended_df['new_index'] = SeriesString(
            base_node=appended_df.base_node,
            engine=appended_df.engine,
            expression=new_index_expr,
            group_by=None,
            sorted_ascending=None,
            name='new_index',
            index=appended_df.index,
        )

        if len(all_index_dtypes) == 1 and len(appended_df.index) == 2:
            appended_df['new_index'] = appended_df['new_index'].astype(all_index_dtypes.pop())

        return appended_df.set_index('new_index', drop=True)


class AppendSqlModel(BachSqlModel):
    def __init__(
        self,
        *,
        column_names: Tuple[str, ...],
        caller_columns_expr: Expression,
        other_columns_expr: Expression,
        caller_node: BachSqlModel,
        other_node: BachSqlModel,
        variables: Dict['DtypeNamePair', Hashable],
    ) -> None:
        name = 'append_sql'
        sql = f'''
            select {caller_columns_expr.to_sql()}
            from {{{{caller_node}}}}
            union all
            select {other_columns_expr.to_sql()}
            from {{{{other_node}}}}
        '''
        all_expressions = [caller_columns_expr, other_columns_expr]
        references = construct_references(
            base_references={'caller_node': caller_node, 'other_node': other_node},
            expressions=all_expressions
        )

        super().__init__(
            model_spec=CustomSqlModelBuilder(sql=sql, name=name),
            properties=self._get_properties(variables, all_expressions),
            references=references,
            materialization=Materialization.CTE,
            materialization_name=None,
            columns=column_names
        )

    @classmethod
    def _get_properties(
        cls,
        variables: Dict['DtypeNamePair', Hashable],
        expressions: List[Expression],
    ) -> Dict[str, str]:
        filtered_variables = filter_variables(variables, expressions)
        return get_variable_values_sql(filtered_variables)
