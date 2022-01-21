from dataclasses import dataclass
from typing import Tuple, Dict, Hashable, List

from bach.dataframe import DtypeNamePair
from bach import DataFrame, DataFrameOrSeries, Series
from bach.expression import Expression, join_expressions
from bach.sql_model import BachSqlModel, construct_references, get_variable_values_sql, filter_variables
from bach.utils import ResultColumn, get_result_columns_dtype_mapping
from sql_models.model import CustomSqlModelBuilder, Materialization


@dataclass
class ConcatOperation:
    dfs: List[DataFrameOrSeries]
    ignore_index: bool = False
    sort: bool = False

    def __call__(self, *args, **kwargs) -> DataFrameOrSeries:
        if not len(self.dfs):
            raise ValueError('no dataframe or series to concatenate.')

        if len(self.dfs) == 1:
            return self.dfs[0].copy_override()

        dfs: List[DataFrame] = []
        for df in self.dfs:
            df = df.to_frame() if isinstance(df, Series) else df.copy_override()
            if self.ignore_index:
                df = df.reset_index(drop=True)

            dfs.append(self._fill_missing_series(df=df).materialize())

        return self._get_df(dfs)

    def _fill_missing_series(self, df: DataFrame) -> DataFrame:
        df_cp = df.copy_override()
        new_indexes = self._get_indexes()
        new_data_columns = self._get_series()

        def _fill_series(
            df_cp: DataFrame, result_columns: Dict[str, ResultColumn],
        ) -> DataFrame:
            for idx, rc in result_columns.items():
                if idx not in df_cp.all_series:
                    df_cp[idx] = None
                    df_cp[idx] = df_cp[rc.name].astype(rc.dtype)
                elif df_cp.all_series[idx].dtype != rc.dtype:
                    df_cp.all_series[rc.name] = df_cp.all_series[rc.name].astype(rc.dtype)

            return df_cp

        df_cp = _fill_series(df_cp, new_indexes)
        df_cp = _fill_series(df_cp, new_data_columns)
        return df_cp

    def _join_column_expressions(self, df: DataFrame) -> Expression:
        new_indexes = self._get_indexes()
        new_data_columns = self._get_series()

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
        for df in self.dfs:
            if not new_indexes:
                new_indexes = {
                    idx: ResultColumn(name=idx, expression=series.expression, dtype=series.dtype)
                    for idx, series in df.index.items()
                }
                continue

            if set(new_indexes.keys()) != set(df.index_columns):
                raise ValueError('concatenation with different index levels is not supported yet.')

        return new_indexes

    def _get_series(self) -> Dict[str, ResultColumn]:
        final_series = {
            series_name: ResultColumn(
                name=series_name,
                expression=df[series_name].expression,
                dtype=df[series_name].dtype,
            )
            for df in self.dfs
            for series_name in df.data_columns
        }
        if self.sort:
            return {s: final_series[s] for s in sorted(final_series)}

        return final_series

    def _get_df(self, dfs: List[DataFrame]) -> DataFrame:
        new_indexes = self._get_indexes()
        new_data_columns = self._get_series()

        main_df = dfs[0]
        variables = {}
        savepoints = main_df.savepoints
        for df in dfs:
            variables.update(df.variables)
            savepoints.merge(df.savepoints)

        return main_df.copy_override(
            engine=main_df.engine,
            base_node=self._get_model(dfs, variables),
            index_dtypes=get_result_columns_dtype_mapping(list(new_indexes.values())),
            series_dtypes=get_result_columns_dtype_mapping(list(new_data_columns.values())),
            savepoints=savepoints,
            variables=variables,
        )

    def _get_model(
        self,
        dfs: List[DataFrame],
        variables: Dict['DtypeNamePair', Hashable],
    ) -> 'ConcatSqlModel':
        new_indexes = self._get_indexes()
        new_data_columns = self._get_series()

        new_index_names = [rc.name for rc in new_indexes.values()]
        new_data_columns_names = [rc.name for rc in new_data_columns.values()]

        column_expressions = [self._join_column_expressions(df=df) for df in dfs]

        return ConcatSqlModel(
            column_names=tuple(new_index_names + new_data_columns_names),
            all_column_expressions=column_expressions,
            all_nodes=[df.base_node for df in dfs],
            variables=variables,  # type: ignore
        )


class ConcatSqlModel(BachSqlModel):
    def __init__(
        self,
        *,
        column_names: Tuple[str, ...],
        all_column_expressions: List[Expression],
        all_nodes: List[BachSqlModel],
        variables: Dict['DtypeNamePair', Hashable],
    ) -> None:
        name = 'append_sql'
        base_sql = 'select {column_expr} from {node}'
        sql = ' union all '.join(
            base_sql.format(column_expr=col_expr.to_sql(), node=f"{{{{node_{idx}}}}}")
            for idx, (col_expr, node) in enumerate(zip(all_column_expressions, all_nodes))
        )

        references = construct_references(
            base_references={f'node_{idx}': node for idx, node in enumerate(all_nodes)},
            expressions=all_column_expressions
        )

        super().__init__(
            model_spec=CustomSqlModelBuilder(sql=sql, name=name),
            properties=self._get_properties(variables, all_column_expressions),
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
