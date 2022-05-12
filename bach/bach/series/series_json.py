"""
Copyright 2021 Objectiv B.V.
"""
import json
from typing import Dict, Union, TYPE_CHECKING, Tuple, cast, Optional

from sqlalchemy.engine import Dialect

from bach.series import Series
from bach.expression import Expression
from bach.series.series import WrappedPartition, ToPandasInfo
from bach.types import DtypeOrAlias, StructuredDtype, AllSupportedLiteralTypes
from sql_models.constants import DBDialect
from sql_models.util import quote_string, is_postgres, DatabaseNotSupportedException, is_bigquery

if TYPE_CHECKING:
    from bach.series import SeriesBoolean, SeriesString


class SeriesJsonb(Series):
    """
    A Series that represents the Postgres jsonb type and its specific operations.

    This is the standard and recommended type to use for handling json like data.

    .. note::
        SeriesJsonb is only supported on Postgres.
        SeriesJson offers comparable functionality and is supported on both Postgres and Bigquery.

    **Getting data**

    It is possible to get a selection of data from the json in the json type column. For selecting data from
    json, arrays and objects are supported. The data can be selected using `.json[]` on the json column

    Selecting data from an array is based on position. It works similar to slicing through python lists.

    .. note::

        Slicing is only possible if *all* values in the column are lists or None.

    Selecting from objects is possible by key.

    Examples:

     .. testsetup:: jsonb
        :skipif: engine is None

        data = ['["a","b","c"]', '["d","e","f","g"]', '[{"h":"i","j":"k"},{"l":["m","n","o"]},{"p":"q"}]']
        pdf = pd.DataFrame(data=data, columns=['jsonb_column'])
        df = DataFrame.from_pandas(engine, pdf, convert_objects=True)
        df['jsonb_column'] = df.jsonb_column.astype('jsonb')

    .. doctest:: jsonb
        :skipif: engine is None

        >>> pdf
                                                jsonb_column
        0                                      ["a","b","c"]
        1                                  ["d","e","f","g"]
        2  [{"h":"i","j":"k"},{"l":["m","n","o"]},{"p":"q"}]

    .. doctest:: jsonb
        :skipif: engine is None

        >>> df = DataFrame.from_pandas(engine, pdf, convert_objects=True)
        >>> df['jsonb_column'] = df.jsonb_column.astype('jsonb')
        >>> # load some json strings and convert them to jsonb type
        >>> # slice and show with .head()
        >>> df.jsonb_column.json[:2].head()
        _index_0
        0                                            [a, b]
        1                                            [d, e]
        2    [{'h': 'i', 'j': 'k'}, {'l': ['m', 'n', 'o']}]
        Name: jsonb_column, dtype: object

    .. doctest:: jsonb
        :skipif: engine is None

        >>> df.jsonb_column.json[1].head()
        _index_0
        0                         b
        1                         e
        2    {'l': ['m', 'n', 'o']}
        Name: jsonb_column, dtype: object

    .. doctest:: jsonb
        :skipif: engine is None

        >>> # selecting from objects is done by entering a key:
        >>> df.jsonb_column.json[1].json['l'].head()
        _index_0
        0         None
        1         None
        2    [m, n, o]
        Name: jsonb_column, dtype: object

    A last case is selecting based on the objects *in* an array.
    With this method, a dict is passed in the `.json[]` selector. The value of the first match with the dict
    to the objects in a json array is returned for the `.json[]` selector. A match is when all key/value pairs
    of the dict are found in an object. This can be used for selecting a subset of a json array with objects.

    .. doctest:: jsonb
        :skipif: engine is None

        >>> # selecting from arrays by searching objects in the array.
        >>> df.jsonb_column.json[:{"j":"k"}].head()
        _index_0
        0                      None
        1                      None
        2    [{'h': 'i', 'j': 'k'}]
        Name: jsonb_column, dtype: object

    .. doctest:: jsonb
        :skipif: engine is None

        >>> # or:
        >>> df.jsonb_column.json[{"l":["m","n","o"]}:].head()
        _index_0
        0                                    None
        1                                    None
        2    [{'l': ['m', 'n', 'o']}, {'p': 'q'}]
        Name: jsonb_column, dtype: object
    """
    dtype = 'jsonb'
    # todo can only assign a type to one series type, and object is quite generic
    dtype_aliases: Tuple[DtypeOrAlias, ...] = tuple()
    supported_db_dtype = {
        DBDialect.POSTGRES: 'jsonb',
    }
    supported_value_types = (dict, list)
    return_dtype = dtype

    @property
    def json(self):
        """
        .. _json_accessor:

        Get access to json operations via the class that's return through this accessor.
        Use as `my_series.json.get_value()` or `my_series.json[:2]`

        .. autoclass:: bach.SeriesJsonb.Json
            :members:
            :special-members: __getitem__

        """
        return JsonBPostgresAccessor(self)

    @property
    def elements(self):
        return JsonBPostgresAccessor(self)

    @classmethod
    def supported_literal_to_expression(cls, dialect: Dialect, literal: Expression) -> Expression:
        cls.assert_engine_dialect_supported(dialect)
        return Expression.construct(f'cast({{}} as {cls.get_db_dtype(dialect)})', literal)

    @classmethod
    def supported_value_to_literal(
            cls,
            dialect: Dialect,
            value: Union[dict, list],
            dtype: StructuredDtype
    ) -> Expression:
        cls.assert_engine_dialect_supported(dialect)
        json_value = json.dumps(value)
        return Expression.string_value(json_value)

    @classmethod
    def dtype_to_expression(cls, dialect: Dialect, source_dtype: str, expression: Expression) -> Expression:
        cls.assert_engine_dialect_supported(dialect)
        if source_dtype == 'jsonb':
            return expression
        if source_dtype in ['string', 'json']:
            return Expression.construct(f'cast({{}} as {cls.get_db_dtype(dialect)})', expression)
        raise ValueError(f'cannot convert {source_dtype} to jsonb')

    def _comparator_operation(self, other, comparator, other_dtypes=('json', 'jsonb')) -> 'SeriesBoolean':
        result = self._binary_operation(
            other, operation=f"comparator '{comparator}'",
            fmt_str=f'cast({{}} as jsonb) {comparator} cast({{}} as jsonb)',
            other_dtypes=other_dtypes, dtype='bool'
        )
        return cast('SeriesBoolean', result)  # we told _binary_operation to return dtype='bool'

    def __le__(self, other) -> 'SeriesBoolean':
        return self._comparator_operation(other, "<@")

    def __ge__(self, other) -> 'SeriesBoolean':
        return self._comparator_operation(other, "@>")

    def min(self, partition: WrappedPartition = None, skipna: bool = True):
        """ INTERNAL: Only here to not trigger errors from describe """
        raise NotImplementedError()

    def max(self, partition: WrappedPartition = None, skipna: bool = True):
        """ INTERNAL: Only here to not trigger errors from describe """
        raise NotImplementedError()


class SeriesJson(Series):
    """
    A Series that represents the json type.

    When `json` data is encountered in a sql table, this dtype is used. On Postgres for all operations the
    data is first cast to jsonb type. Therefore on Postgres using that type might be more efficient.

    The public interface of this class is the same as the :py:class:`SeriesJsonb` class. See the docstring
    of that class for more information.

    TODO: move documentation here, and have SeriesJsonB point here
    """
    # TODO: support instance_dtype to return better types

    dtype = 'json'
    dtype_aliases: Tuple[DtypeOrAlias, ...] = tuple()
    supported_db_dtype = {
        DBDialect.POSTGRES: 'json',
        # on BigQuery we use STRING for JSONs. Of course SeriesString is the default class for that, so
        # here we set None
        DBDialect.BIGQUERY: None
    }

    @property
    def json(self):
        """
        .. _json_accessor:

        Get access to json operations via the class that's return through this accessor.
        Use as `my_series.json.get_value()` or `my_series.json[:2]`

        .. autoclass:: bach.SeriesJsonb.Json
            :members:
            :special-members: __getitem__

        """
        if is_postgres(self.engine):
            jsonb_series = cast('SeriesJsonb', self.astype('jsonb'))
            return JsonBPostgresAccessor(jsonb_series)
        if is_bigquery(self.engine):
            return JsonBigQueryAccessor(self)
        raise DatabaseNotSupportedException(self.engine)

    @property
    def elements(self):
        return self.json

    @classmethod
    def supported_literal_to_expression(cls, dialect: Dialect, literal: Expression) -> Expression:
        cls.assert_engine_dialect_supported(dialect)
        return Expression.construct(f'cast({{}} as {cls.get_db_dtype(dialect)})', literal)

    @classmethod
    def supported_value_to_literal(
            cls,
            dialect: Dialect,
            value: Union[dict, list],
            dtype: StructuredDtype
    ) -> Expression:
        cls.assert_engine_dialect_supported(dialect)
        json_value = json.dumps(value)
        return Expression.string_value(json_value)

    @classmethod
    def dtype_to_expression(cls, dialect: Dialect, source_dtype: str, expression: Expression) -> Expression:
        cls.assert_engine_dialect_supported(dialect)
        if is_postgres(dialect):
            if source_dtype == 'json':
                return expression
            if source_dtype in ('jsonb', 'string'):
                return Expression.construct(f'cast({{}} as {cls.get_db_dtype(dialect)})', expression)
            raise ValueError(f'cannot convert {source_dtype} to json')
        if is_bigquery(dialect):
            if source_dtype in ('json', 'string'):
                return expression
            raise ValueError(f'cannot convert {source_dtype} to json')
        raise DatabaseNotSupportedException(dialect)

    def to_pandas_info(self) -> Optional['ToPandasInfo']:
        if is_postgres(self.engine):
            return ToPandasInfo('object', None)
        if is_bigquery(self.engine):
            def convert(x):
                if x is None:
                    return None
                print(f'\n\n\n{x}\n\n\n')
                return json.loads(x)
            return ToPandasInfo('object', convert) # lambda x: json.loads(x) if x is not None else None)
        return None

    def _comparator_operation(
        self,
        other: Union['Series', AllSupportedLiteralTypes],
        comparator: str,
        other_dtypes=tuple()
    ) -> 'SeriesBoolean':
        if is_postgres(self.engine):
            other_dtypes = ('json', 'jsonb', 'string')
            fmt_str = f'cast({{}} as jsonb) {comparator} cast({{}} as jsonb)'
        elif is_bigquery(self.engine):
            other_dtypes = ('json', 'string')
            fmt_str = f'{{}} {comparator} {{}}'
        else:
            raise DatabaseNotSupportedException(self.engine)

        result = self._binary_operation(
            other, operation=f"comparator '{comparator}'",
            fmt_str=fmt_str,
            other_dtypes=other_dtypes, dtype='bool'
        )
        return cast('SeriesBoolean', result)  # we told _binary_operation to return dtype='bool'

    def __le__(self, other: Union['Series', AllSupportedLiteralTypes]) -> 'SeriesBoolean':
        if is_postgres(self.engine):
            return self._comparator_operation(other, "<@")
        return self._comparator_operation(other, "<=")

    def __ge__(self, other: Union['Series', AllSupportedLiteralTypes]) -> 'SeriesBoolean':
        if is_postgres(self.engine):
            return self._comparator_operation(other, "@>")
        return self._comparator_operation(other, ">=")

    def min(self, partition: WrappedPartition = None, skipna: bool = True):
        """ INTERNAL: Only here to not trigger errors from describe """
        raise NotImplementedError()

    def max(self, partition: WrappedPartition = None, skipna: bool = True):
        """ INTERNAL: Only here to not trigger errors from describe """
        raise NotImplementedError()


class JsonBigQueryAccessor:
    """
    class with accessor methods to JSON type data columns on BigQuery.
    """
    def __init__(self, series_object: 'SeriesJson'):
        self._series_object = series_object

    def __getitem__(self, key: Union[str, int, slice]):
        """
        TODO
        """
        # TODO: leverage instance_dtype information here, if we have that
        if isinstance(key, int):
            expression = Expression.construct(f'''JSON_QUERY({{}}, '$[{key}]')''', self._series_object)
            #expression = Expression.construct('COALESCE(JSON_VALUE({}), {})', expression, expression)
            return self._series_object.copy_override(expression=expression)
        elif isinstance(key, str):
            return self.get_value(key)

    def get_value(self, key: str, as_str: bool = False) -> Union['SeriesString', 'SeriesJson']:
        """
        Select values from objects by key. This works only on scalar values! to get json objects use
        __getitem__, that is, object['key']

        :param key: the key to return the values for.
        :param as_str: if True, it returns a string Series, json otherwise.
        :returns: series with the selected object value.
        """
        # TODO: ESCAPE KEY!
        # note: escaping is function dependent. for JSON_VALUE[1]: 'If a JSON key uses invalid JSONPath
        # characters, then you can escape those characters using double quotes.'
        # [1] https://cloud.google.com/bigquery/docs/reference/standard-sql/json_functions#json_value
        assert '"' not in key

        # Super lame hack:
        # On postgres if the result of 'data->{key}' is a string, then we get back a string.
        # On BigQuery if the result of 'JSON_QUERY(data, '$.{key}') is a string, then we get back a json
        #  string. That is, the returned value has quotes. We want the same behaviour here.
        # What we do: get the json value, then try to extract the scalar value, if it is not a scalar value
        # it will return NULL. So based on that we can know whether it is a string or a complex value

        # TODO: evaluate what we want as behaviour, is the old behaviour best? The tests now pass, but this
        # actually doesn't make a lot of sense!?

        # expression = Expression.construct(f'''JSON_VALUE({{}}, '$."{key}"')''', self._series_object)

        expression = Expression.construct(f'''JSON_QUERY({{}}, '$."{key}"')''', self._series_object)
        #expression = Expression.construct('COALESCE(JSON_VALUE({}), {})', expression, expression)

        if not as_str:
            return self._series_object.copy_override(expression=expression)
        return self._series_object.copy_override(expression=expression).copy_override_type(SeriesString)


class JsonBPostgresAccessor:
    """
    class with accessor methods to jsonb type data columns on Postgres.
    """
    def __init__(self, series_object: 'SeriesJsonb'):
        self._series_object = series_object

    def __getitem__(self, key: Union[str, int, slice]):
        """
        Slice this jsonb database object in pythonic ways:

        :param key: A very mixed key to slice on, please see below.

        .. testsetup:: jsonb__getitem__
            :skipif: engine is None

            data = [
                '["a","b","c"]', '["d","e","f","g"]', '[{"h":"i","j":"k"},{"l":["m","n","o"]},{"p":"q"}]',
            ]
            pdf = pd.DataFrame(data=data, columns=['jsonb_column'])
            df = DataFrame.from_pandas(engine, pdf, convert_objects=True)
            df['jsonb_column'] = df.jsonb_column.astype('jsonb')

        .. doctest:: jsonb__getitem__
            :skipif: engine is None

            >>> # slice and show with .head()
            >>> df.jsonb_column.json[:2].head()
            _index_0
            0                                            [a, b]
            1                                            [d, e]
            2    [{'h': 'i', 'j': 'k'}, {'l': ['m', 'n', 'o']}]
            Name: jsonb_column, dtype: object

        .. doctest:: jsonb__getitem__
            :skipif: engine is None

            >>> # selecting one position returns the single entry:
            >>> df.jsonb_column.json[1].head()
            _index_0
            0                         b
            1                         e
            2    {'l': ['m', 'n', 'o']}
            Name: jsonb_column, dtype: object

        .. doctest:: jsonb__getitem__
            :skipif: engine is None

            >>> # selecting from objects is done by entering a key:
            >>> df.jsonb_column.json[1].json['l'].head()
            _index_0
            0         None
            1         None
            2    [m, n, o]
            Name: jsonb_column, dtype: object

        Or select based on the objects *in* an array.
        With this method, a dict is passed in the `.json[]` selector. The value of the first match with
        the dict to the objects in a json array is returned for the `.json[]` selector. A match is when
        all key/value pairs of the dict are found in an object. This can be used for selecting a subset
        of a json array with objects.

        .. doctest:: jsonb__getitem__
            :skipif: engine is None

            >>> # selecting from arrays by searching objects in the array.
            >>> df.jsonb_column.json[:{"j":"k"}].head()
            _index_0
            0                      None
            1                      None
            2    [{'h': 'i', 'j': 'k'}]
            Name: jsonb_column, dtype: object

        .. doctest:: jsonb__getitem__
            :skipif: engine is None

            >>> # or:
            >>> df.jsonb_column.json[{"l":["m","n","o"]}:].head()
            _index_0
            0                                    None
            1                                    None
            2    [{'l': ['m', 'n', 'o']}, {'p': 'q'}]
            Name: jsonb_column, dtype: object
        """
        if isinstance(key, int):
            return self._series_object\
                .copy_override_dtype(dtype=self._series_object.return_dtype)\
                .copy_override(expression=Expression.construct(f'{{}}->{key}', self._series_object))
        elif isinstance(key, str):
            return self.get_value(key)
        elif isinstance(key, slice):
            expression_references = 0
            if key.step:
                raise NotImplementedError('slice steps not supported')
            if key.stop is not None:
                negative_stop = ''
                if isinstance(key.stop, int):
                    if key.stop < 0:
                        negative_stop = f'jsonb_array_length({{}})'
                        expression_references += 1
                    stop = f'{negative_stop} {key.stop} - 1'
                elif isinstance(key.stop, (dict, str)):
                    stop = self._find_in_json_list(key.stop)
                    expression_references += 1
                else:
                    raise TypeError('cant')
            if key.start is not None:
                if isinstance(key.start, int):
                    negative_start = ''
                    if key.start < 0:
                        negative_start = f'jsonb_array_length({{}})'
                        expression_references += 1
                    start = f'{negative_start} {key.start}'
                elif isinstance(key.start, (dict, str)):
                    start = self._find_in_json_list(key.start)
                    expression_references += 1
                else:
                    raise TypeError('cant')
                if key.stop is not None:
                    where = f'between {start} and {stop}'
                else:
                    where = f'>= {start}'
            else:
                where = f'<= {stop}'
            combined_expression = f"""(select jsonb_agg(x.value)
            from jsonb_array_elements({{}}) with ordinality x
            where ordinality - 1 {where})"""
            expression_references += 1
            return self._series_object\
                .copy_override_dtype(dtype=self._series_object.return_dtype)\
                .copy_override(
                    expression=Expression.construct(
                        combined_expression,
                        *([self._series_object] * expression_references)
                    )
                )
        raise TypeError(f'key should be int or slice, actual type: {type(key)}')

    def _find_in_json_list(self, key: Union[str, Dict[str, str]]):
        if isinstance(key, (dict, str)):
            key = json.dumps(key)
            quoted_key = quote_string(self._series_object.engine, key)
            expression_str = f"""(select min(case when ({quoted_key}::jsonb) <@ value
            then ordinality end) -1 from jsonb_array_elements({{}}) with ordinality)"""
            return expression_str
        else:
            raise TypeError(f'key should be int or slice, actual type: {type(key)}')

    def get_value(self, key: str, as_str: bool = False):
        """
        Select values from objects by key. Same as using `.json[key]` on the json column.

        :param key: the key to return the values for.
        :param as_str: if True, it returns a string Series, jsonb otherwise.
        :returns: series with the selected object value.
        """
        return_as_string_operator = ''
        return_dtype = self._series_object.return_dtype
        if as_str:
            return_as_string_operator = '>'
            return_dtype = 'string'
        expression = Expression.construct(f"{{}}->{return_as_string_operator}{{}}",
                                          self._series_object,
                                          Expression.string_value(key))
        return self._series_object\
            .copy_override_dtype(dtype=return_dtype)\
            .copy_override(expression=expression)
