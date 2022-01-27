import itertools
from collections import defaultdict
from dataclasses import dataclass
from operator import attrgetter
from typing import Tuple, Dict, Hashable, List, Set

from bach.dataframe import DtypeNamePair
from bach import DataFrame, const_to_series, get_series_type_from_dtype, SeriesAbstractNumeric, Series
from bach.expression import Expression, join_expressions
from bach.sql_model import BachSqlModel, construct_references, get_variable_values_sql, filter_variables
from bach.utils import ResultSeries, get_result_series_dtype_mapping
from sql_models.model import CustomSqlModelBuilder, Materialization


@dataclass
class ConcatOperation:
    dfs: List[DataFrame]
    ignore_index: bool = False
    sort: bool = False

    def __call__(self, *args, **kwargs) -> DataFrame:
        if not len(self.dfs):
            raise ValueError('no dataframe or series to concatenate.')

        if len(self.dfs) == 1:
            return self.dfs[0].copy_override()

        dfs: List[DataFrame] = []
        for df in self.dfs:
            df_cp = df.copy_override()
            if self.ignore_index:
                df_cp.reset_index(drop=True, inplace=True)

            dfs.append(self._fill_missing_series(df=df_cp).materialize())

        return self._get_concatenated_dataframe(dfs)

    def _fill_missing_series(self, df: DataFrame) -> DataFrame:
        """
        adds non-shared series between current df and resultant concatenated df
        """
        df_cp = df.copy_override()
        new_indexes = self._get_indexes()
        new_data_series = self._get_series()

        all_result_series: Dict[str, ResultSeries] = {**new_indexes, **new_data_series}
        for name, result_series in all_result_series.items():
            if name not in df_cp.all_series:
                df_cp[name] = const_to_series(base=df_cp, value=None, name=name)
                df_cp[name] = df_cp[name].astype(result_series.dtype)
                continue

            if name in df_cp.index:
                df_cp.index[name] = df_cp.index[name].astype(result_series.dtype)
            else:
                df_cp[name] = df_cp[name].astype(result_series.dtype)

        return df_cp

    def _join_series_expressions(self, df: DataFrame) -> Expression:
        """
        generates the column expression for df's subquery
        """
        new_indexes = self._get_indexes()
        new_data_series = self._get_series()

        expressions = []

        all_result_series: Dict[str, ResultSeries] = {**new_indexes, **new_data_series}
        for idx, rc in all_result_series.items():
            if idx not in df.all_series:
                expressions.append(Expression.construct('NULL as {}', Expression.identifier(rc.name)))
            else:
                expressions.append(Expression.construct_expr_as_name(expr=rc.expression, name=rc.name))

        return join_expressions(expressions)

    def _get_indexes(self) -> Dict[str, ResultSeries]:
        """
        gets the indexes of the final concatenated dataframe
        """
        if self.ignore_index:
            return {}

        all_indexes = list(itertools.chain.from_iterable(df.index.values() for df in self.dfs))
        merged_indexes = self._get_result_series(all_indexes)

        # all dataframes should have the same indexes
        for df in self.dfs:
            if set(merged_indexes.keys()) != set(df.index_columns):
                raise ValueError('concatenation with different index levels is not supported yet.')

        return merged_indexes

    def _get_series(self) -> Dict[str, ResultSeries]:
        """
        gets the data series of the final concatenated dataframe
        """
        all_series = list(itertools.chain.from_iterable(df.data.values() for df in self.dfs))
        return self._get_result_series(all_series)

    def _get_result_series(self, series: List[Series]) -> Dict[str, ResultSeries]:
        """
        merges all shared series and defines final dtype
        """

        series_dtypes = defaultdict(set)
        for s in series:
            series_dtypes[s.name].add(s.dtype)

        result_series = {}
        series_names = sorted(series_dtypes) if self.sort else series_dtypes.keys()
        for series_name in series_names:

            if len(series_dtypes[series_name]) == 1:
                final_dtype = series_dtypes[series_name].pop()
            elif all(
                issubclass(get_series_type_from_dtype(dtype), SeriesAbstractNumeric)
                for dtype in series_dtypes[series_name]
            ):
                final_dtype = 'float64'

            else:
                final_dtype = 'string'

            result_series[series_name] = ResultSeries(
                name=series_name,
                expression=Expression.identifier(series_name),
                dtype=final_dtype,
            )

        return result_series

    def _get_concatenated_dataframe(self, dfs: List[DataFrame]) -> DataFrame:
        new_indexes = self._get_indexes()
        new_data_series = self._get_series()

        main_df = dfs[0]
        variables = {}
        savepoints = main_df.savepoints

        # variables are overridden based on the order of concatenation. This means that the initial dataframe
        # will have higher priority over the following dataframes
        for df in reversed(dfs):
            variables.update(df.variables)
            savepoints.merge(df.savepoints)

        return main_df.copy_override(
            base_node=self._get_model(dfs, variables),
            index_dtypes=get_result_series_dtype_mapping(list(new_indexes.values())),
            series_dtypes=get_result_series_dtype_mapping(list(new_data_series.values())),
            savepoints=savepoints,
            variables=variables,
        )

    def _get_model(
        self,
        dfs: List[DataFrame],
        variables: Dict['DtypeNamePair', Hashable],
    ) -> 'ConcatSqlModel':
        new_indexes = self._get_indexes()
        new_data_series = self._get_series()

        new_index_names = [rs.name for rs in new_indexes.values()]
        new_data_series_names = [rs.name for rs in new_data_series.values()]

        series_expressions = [self._join_series_expressions(df=df) for df in dfs]

        return ConcatSqlModel.get_instance(
            series_names=tuple(new_index_names + new_data_series_names),
            all_series_expressions=series_expressions,
            all_nodes=[df.base_node for df in dfs],
            variables=variables,  # type: ignore
        )


class ConcatSqlModel(BachSqlModel):
    @classmethod
    def get_instance(
        cls,
        *,
        series_names: Tuple[str, ...],
        all_series_expressions: List[Expression],
        all_nodes: List[BachSqlModel],
        variables: Dict['DtypeNamePair', Hashable],
    ) -> 'ConcatSqlModel':
        name = 'concat_sql'
        base_sql = 'select {serie_expr} from {node}'
        sql = ' union all '.join(
            base_sql.format(serie_expr=col_expr.to_sql(), node=f"{{{{node_{idx}}}}}")
            for idx, col_expr in enumerate(all_series_expressions)
        )

        references = construct_references(
            base_references={f'node_{idx}': node for idx, node in enumerate(all_nodes)},
            expressions=all_series_expressions
        )

        return ConcatSqlModel(
            model_spec=CustomSqlModelBuilder(sql=sql, name=name),
            placeholders=cls._get_placeholders(variables, all_series_expressions),
            references=references,
            materialization=Materialization.CTE,
            materialization_name=None,
            columns=series_names
        )
