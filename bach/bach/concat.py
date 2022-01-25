from abc import ABC
from bach.dataframe import DataFrameOrSeries
import itertools
from collections import defaultdict
from dataclasses import dataclass
from typing import Tuple, Dict, Hashable, List, Set, Sequence

from bach.dataframe import DtypeNamePair
from bach import DataFrame, const_to_series, get_series_type_from_dtype, SeriesAbstractNumeric, Series
from bach.expression import Expression, join_expressions
from bach.sql_model import BachSqlModel, construct_references
from bach.utils import ResultSeries, get_result_series_dtype_mapping
from sql_models.model import CustomSqlModelBuilder, Materialization


DEFAULT_CONCAT_SERIES_DTYPE = 'string'


def get_merged_series_dtype(dtypes: Set[str]) -> str:
    if len(dtypes) == 1:
        return dtypes.pop()
    elif all(
        issubclass(get_series_type_from_dtype(dtype), SeriesAbstractNumeric)
        for dtype in dtypes
    ):
        return'float64'

    return DEFAULT_CONCAT_SERIES_DTYPE


@dataclass
class ConcatOperation(ABC):
    objects: Sequence[DataFrameOrSeries]
    ignore_index: bool = False
    sort: bool = False

    def __call__(self, *args, **kwargs) -> DataFrameOrSeries:
        if not len(self.objects):
            raise ValueError('no objects to concatenate.')

        if len(self.objects) == 1:
            return self.objects[0].copy_override()
        return self._get_concatenated_object()

    def _get_indexes(self) -> Dict[str, ResultSeries]:
        """
        gets the indexes of the final concatenated dataframe or series
        """
        if self.ignore_index:
            return {}

        all_indexes = list(itertools.chain.from_iterable(obj.index.values() for obj in self.objects))
        merged_indexes = self._get_result_series(all_indexes)

        # all objects should have the same indexes
        for obj in self.objects:
            if set(merged_indexes.keys()) != set(obj.index.keys()):
                raise ValueError('concatenation with different index levels is not supported yet.')

        return merged_indexes

    def _get_series(self) -> Dict[str, ResultSeries]:
        raise NotImplementedError()

    def _get_result_series(self, series: List[Series]) -> Dict[str, ResultSeries]:
        """
        merges all shared series and defines final dtype
        """

        series_dtypes = defaultdict(set)
        for s in series:
            series_dtypes[s.name].add(s.dtype)

        series_names = sorted(series_dtypes) if self.sort else series_dtypes.keys()

        return {
            series_name: ResultSeries(
                name=series_name,
                expression=Expression.identifier(series_name),
                dtype=get_merged_series_dtype(series_dtypes[series_name]),
            )
            for series_name in series_names
        }

    def _join_series_expressions(self, obj: DataFrameOrSeries) -> Expression:
        raise NotImplementedError()

    def _get_concatenated_object(self) -> DataFrameOrSeries:
        raise NotImplementedError()

    def _get_model(
        self,
        objects: List[DataFrameOrSeries],
        variables: Dict['DtypeNamePair', Hashable],
    ) -> 'ConcatSqlModel':
        raise NotImplementedError()


class DataFrameConcatOperation(ConcatOperation):
    def _get_overridden_objects(self) -> List[DataFrame]:
        """
        generates a copy for each dataframe and prepares them for concatentation
        """
        dfs: List[DataFrame] = []
        for obj in self.objects:
            if isinstance(obj, Series):
                raise Exception('Cannot concat Series to DataFrame')

            df = obj.copy_override()
            if self.ignore_index:
                df.reset_index(drop=True, inplace=True)

            dfs.append(self._fill_missing_series(df=df).materialize())

        return dfs

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

    def _join_series_expressions(self, obj: DataFrameOrSeries) -> Expression:
        """
        generates the column expression for the object subquery
        """
        if isinstance(obj, Series):
            raise Exception('a dataframe object is expected.')

        new_indexes = self._get_indexes()
        new_data_series = self._get_series()

        expressions = []

        all_result_series: Dict[str, ResultSeries] = {**new_indexes, **new_data_series}
        for idx, rc in all_result_series.items():
            if idx not in obj.all_series:
                expressions.append(Expression.construct('NULL as {}', Expression.identifier(rc.name)))
            else:
                expressions.append(Expression.construct_expr_as_name(expr=rc.expression, name=rc.name))

        return join_expressions(expressions)

    def _get_series(self) -> Dict[str, ResultSeries]:
        """
        gets the data series of the final concatenated dataframe
        """
        all_series = list(
            itertools.chain.from_iterable(
                df.data.values() for df in self.objects if isinstance(df, DataFrame)
            )
        )
        return self._get_result_series(all_series)

    def _get_concatenated_object(self) -> DataFrameOrSeries:
        objects = self._get_overridden_objects()
        new_indexes = self._get_indexes()
        new_data_series = self._get_series()

        main_df: DataFrame = objects[0]
        variables = {}
        savepoints = main_df.savepoints

        for df in reversed(objects):
            variables.update(df.variables)
            savepoints.merge(df.savepoints)

        return main_df.copy_override(
            base_node=self._get_model(objects, variables),
            index_dtypes=get_result_series_dtype_mapping(list(new_indexes.values())),
            series_dtypes=get_result_series_dtype_mapping(list(new_data_series.values())),
            savepoints=savepoints,
            variables=variables,
        )

    def _get_model(
        self,
        objects: Sequence[DataFrameOrSeries],
        variables: Dict['DtypeNamePair', Hashable],
    ) -> 'ConcatSqlModel':
        new_indexes = self._get_indexes()
        new_data_series = self._get_series()

        new_index_names = [rs.name for rs in new_indexes.values()]
        new_data_series_names = [rs.name for rs in new_data_series.values()]

        series_expressions = [self._join_series_expressions(df) for df in objects]

        return ConcatSqlModel(
            series_names=tuple(new_index_names + new_data_series_names),
            all_series_expressions=series_expressions,
            all_nodes=[df.base_node for df in objects],
            variables=variables,  # type: ignore
        )


class SeriesConcatOperation(ConcatOperation):
    def _get_overridden_objects(self) -> List[Series]:
        """
        creates new copies for each series to be concatenated
        """
        series = []
        for obj in self.objects:
            if isinstance(obj, DataFrame):
                raise Exception('Cannot concat DataFrame to Series')
            series.append(obj.copy_override())
        return series

    def _get_series(self) -> Dict[str, ResultSeries]:
        """
        gets the final data series result
        """
        all_names = []
        dtypes: Set[str] = set()

        for series in self.objects:
            if not isinstance(series, Series):
                continue
            all_names.append(series.name)
            dtypes.add(series.dtype)

        main_series = self.objects[0].copy_override(
            name='_'.join(all_names),
            dtype=get_merged_series_dtype(dtypes),
        )
        return self._get_result_series([main_series])  # type: ignore

    def _join_series_expressions(self, obj: DataFrameOrSeries) -> Expression:
        """
        generates the column expression for the object subquery
        """
        if isinstance(obj, DataFrame):
            raise Exception('a series object is expected.')

        dtype = get_merged_series_dtype({
            series.dtype for series in self.objects if isinstance(series, Series)
        })
        series_expression = obj.astype(dtype).expression

        if self.ignore_index:
            return series_expression

        index_expressions = [idx.expression for idx in self._get_indexes().values()]
        return join_expressions(index_expressions + [series_expression])

    def _get_concatenated_object(self) -> DataFrameOrSeries:
        objects = self._get_overridden_objects()
        main_series: Series = objects[0]
        final_result_series = list(self._get_series().values())[0]

        return main_series.copy_override(
            base_node=self._get_model(objects, variables={}),
            name=final_result_series.name,
            dtype=final_result_series.dtype,
            index={} if self.ignore_index else main_series.index,
        )

    def _get_model(
        self,
        objects: Sequence[DataFrameOrSeries],
        variables: Dict['DtypeNamePair', Hashable],
    ) -> 'ConcatSqlModel':
        series_expressions = [self._join_series_expressions(obj) for obj in objects]

        return ConcatSqlModel(
            series_names=tuple('concatenated_series'),
            all_series_expressions=series_expressions,
            all_nodes=[series.base_node for series in objects],
            variables=variables,  # type: ignore
        )


class ConcatSqlModel(BachSqlModel):
    def __init__(
        self,
        *,
        series_names: Tuple[str, ...],
        all_series_expressions: List[Expression],
        all_nodes: List[BachSqlModel],
        variables: Dict['DtypeNamePair', Hashable],
    ) -> None:
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

        super().__init__(
            model_spec=CustomSqlModelBuilder(sql=sql, name=name),
            placeholders=self._get_placeholders(variables, all_series_expressions),
            references=references,
            materialization=Materialization.CTE,
            materialization_name=None,
            columns=series_names
        )
