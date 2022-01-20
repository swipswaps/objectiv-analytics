from copy import copy
from dataclasses import dataclass
from typing import Tuple, Dict, Hashable, List

from bach import DataFrame, SeriesString
from bach.expression import Expression, join_expressions
from bach.sql_model import BachSqlModel, construct_references, get_variable_values_sql, filter_variables
from bach.utils import ResultColumn, get_result_columns_dtype_mapping
from sql_models.model import CustomSqlModelBuilder, Materialization


@dataclass
class AppendOperation:
    caller_df: DataFrame
    other_df: DataFrame
    ignore_index: bool = False
    sort: bool = False

    def append(self) -> DataFrame:
        new_indexes = self._get_indexes()
        new_data_columns = self._get_series()

        caller_df = self.caller_df.copy_override()
        other_df = self.other_df.copy_override()
        if self.ignore_index:
            caller_df = caller_df.reset_index(drop=True)
            other_df = other_df.reset_index(drop=True)

        caller_df = self._fill_missing_series(
            df=caller_df,
            new_indexes=new_indexes,
            new_data_columns=new_data_columns,
        )
        caller_df = caller_df.materialize()

        other_df = self._fill_missing_series(
            df=other_df,
            new_indexes=new_indexes,
            new_data_columns=new_data_columns,
            cast_types=True,
        )
        other_df = other_df.materialize()

        appended_df = self._get_appended_df(caller_df, other_df)
        return self._transform_index(appended_df)

    @staticmethod
    def _fill_missing_series(
        df: DataFrame,
        new_indexes: Dict[str, ResultColumn],
        new_data_columns: Dict[str, ResultColumn],
        cast_types: bool = False,
    ) -> DataFrame:
        df_cp = df.copy_override()

        def _fill_series(
            df_cp: DataFrame, result_columns: Dict[str, ResultColumn],
        ) -> DataFrame:
            for idx, rc in result_columns.items():
                if idx not in df_cp.all_series:
                    df_cp[idx] = None
                    df_cp[idx] = df_cp[rc.name].astype(rc.dtype)
                elif cast_types and df_cp.all_series[idx].dtype != rc.dtype:
                    df_cp.all_series[rc.name] = df_cp.all_series[rc.name].astype(rc.dtype)

            return df_cp

        df_cp = _fill_series(df_cp, new_indexes)
        df_cp = _fill_series(df_cp, new_data_columns)
        return df_cp

    @staticmethod
    def _join_column_expressions(
        df: DataFrame,
        new_indexes: Dict[str, ResultColumn],
        new_data_columns: Dict[str, ResultColumn],
    ) -> Expression:
        def _add_expressions(
            result_columns: Dict[str, ResultColumn], existing_columns: List[str],
        ) -> List[Expression]:
            expressions = []
            for idx, rc in result_columns.items():
                if idx not in existing_columns:
                    expressions.append(Expression.construct('NULL as {}', Expression.identifier(rc.name)))
                else:
                    expressions.append(Expression.construct_expr_as_name(expr=rc.expression, name=rc.name))

            return expressions

        index_expressions = _add_expressions(new_indexes, df.index_columns)
        data_column_expressions = _add_expressions(new_data_columns, df.data_columns)
        return join_expressions(index_expressions + data_column_expressions)

    def _get_indexes(self) -> Dict[str, ResultColumn]:
        if self.ignore_index:
            return {}

        new_indexes = {}

        for idx in self.caller_df.index_columns:
            name = f'_index_{idx}' if idx in self.other_df.data_columns else idx
            series = self.caller_df.index[idx]
            new_indexes[idx] = ResultColumn(name=name, expression=series.expression, dtype=series.dtype)

        for idx in self.other_df.index_columns:
            if idx in new_indexes:
                continue

            name = f'_index_{idx}' if idx in self.caller_df.data_columns else idx
            series = self.other_df.index[idx]
            new_indexes[idx] = ResultColumn(name=name, expression=series.expression, dtype=series.dtype)

        return new_indexes

    def _get_series(self) -> Dict[str, ResultColumn]:
        final_series = {
            series_name: ResultColumn(
                name=series_name,
                expression=self.caller_df[series_name].expression,
                dtype=self.caller_df[series_name].dtype,
            )
            for series_name in self.caller_df.data_columns
        }
        final_series.update(
            {
                series_name: ResultColumn(
                    name=series_name,
                    expression=self.other_df[series_name].expression,
                    dtype=self.other_df[series_name].dtype,
                )
                for series_name in self.other_df.data_columns
                if series_name not in final_series
            }
        )
        if self.sort:
            return {s: final_series[s] for s in sorted(final_series)}

        return final_series

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

    def _get_appended_df(self, caller_df: DataFrame, other_df: DataFrame) -> DataFrame:
        new_indexes = self._get_indexes()
        new_data_columns = self._get_series()

        variables = copy(caller_df.variables)
        variables.update(other_df.variables)

        return caller_df.copy_override(
            engine=caller_df.engine,
            base_node=self._get_append_model(caller_df, other_df, variables),
            index_dtypes=get_result_columns_dtype_mapping(list(new_indexes.values())),
            series_dtypes=get_result_columns_dtype_mapping(list(new_data_columns.values())),
            savepoints=caller_df.savepoints.merge(other_df.savepoints),
            variables=variables,
        )

    def _get_append_model(
        self,
        caller_df: DataFrame,
        other_df: DataFrame,
        variables: Dict['DtypeNamePair', Hashable],
    ) -> 'AppendSqlModel':
        new_indexes = self._get_indexes()
        new_data_columns = self._get_series()

        new_index_names = [rc.name for rc in new_indexes.values()]
        new_data_columns_names = [rc.name for rc in new_data_columns.values()]

        caller_columns_expr = self._join_column_expressions(
            df=caller_df,
            new_indexes=new_indexes,
            new_data_columns=new_data_columns,
        )
        other_columns_expr = self._join_column_expressions(
            df=other_df,
            new_indexes=new_indexes,
            new_data_columns=new_data_columns,
        )

        return AppendSqlModel(
            column_names=tuple(new_index_names + new_data_columns_names),
            caller_columns_expr=caller_columns_expr,
            other_columns_expr=other_columns_expr,
            caller_node=caller_df.base_node,
            other_node=other_df.base_node,
            variables=variables,  # type: ignore
        )


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
