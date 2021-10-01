from typing import Type, Tuple, Any, TypeVar, List, TYPE_CHECKING, Dict, Hashable
import datetime
import numpy

"""
Copyright 2021 Objectiv B.V.

Functions for looking up the right classes to handle types and values, and for registering new custom
types.

To prevent cyclic imports, the functions in this file should not be used by pandasql.py before the file
is fully initialized (that is, only use within functions).
"""

if TYPE_CHECKING:
    from buhtuh.pandasql import BuhTuhSeries


def get_series_type_from_dtype(dtype: str) -> Type['BuhTuhSeries']:
    """ Given a dtype, return the correct BuhTuhSeries subclass. """
    return _registry.get_series_type_from_dtype(dtype)


def arg_to_type(value: Any) -> str:
    """
    Give the dtype, as a string of the given value.
    """
    # todo: rename to value_to_dtype()
    return _registry.value_to_dtype(value)


T = TypeVar('T', bound='BuhTuhSeries')


def register_dtype(value_types: List[Type] = None):
    """ Decorator to register a BuhTuhSeries subclass as dtype series"""
    if value_types is None:
        value_types = []

    def wrapper(cls: Type[T]) -> Type[T]:
        dtype = cls.dtype
        # Mypy needs some help here
        assert value_types is not None
        assert isinstance(dtype, str)
        _registry.register_dtype_series(dtype, cls, value_types)
        return cls
    return wrapper


class TypeRegistry:
    def __init__(self):
        # Do the real initialisation in _real_init, which we'll defer until usage so we won't get
        # problems with cyclic imports.

        # dtype_series: Mapping of dtype to a subclass of BuhTuhSeries
        self.dtype_series: Dict[Hashable, Type['BuhTuhSeries']] = {}

        # value_type_dtype: Mapping of python types to matching dtype
        # note that some types could be in this dictionary multiple times. For a subtype its super types
        # might also be in the list. We resolve conflicts in arg_to_type by returning the latest matching
        # entry.
        self.value_type_dtype: List[Tuple[Type, str]] = []

        # db_type_to_dtype: Mapping of Postgres types to dtypes
        self.db_type_to_dtype: Dict[str, str] = {}

    def _real_init(self):
        """
        Load the default dtype and value-type mappings.
        The dtype_series mapping will be based on the dtype and dtype_aliases that the base BuhTuhSeries
            declare
        The value to dtype is hardcoded here for the base classes
        """
        if self.dtype_series:
            # Only initialise once
            return

        # Import locally to prevent cyclic imports
        from buhtuh.pandasql import BuhTuhSeriesBoolean, BuhTuhSeriesInt64, \
            BuhTuhSeriesFloat64, BuhTuhSeriesString, BuhTuhSeriesTimestamp, \
            BuhTuhSeriesDate, BuhTuhSeriesTime, BuhTuhSeriesTimedelta
        base_types: List[Type[BuhTuhSeries]] = [
            BuhTuhSeriesBoolean, BuhTuhSeriesInt64, BuhTuhSeriesFloat64, BuhTuhSeriesString,
            BuhTuhSeriesTimestamp, BuhTuhSeriesDate, BuhTuhSeriesTime, BuhTuhSeriesTimedelta
        ]

        self.dtype_series = {}
        for klass in base_types:
            dtype_and_aliases = [klass.dtype] + list(klass.dtype_aliases)
            for dtype_alias in dtype_and_aliases:
                if dtype_alias in self.dtype_series:
                    raise Exception(f'Type {klass} claims dtype (or dtype alias) {dtype_alias}, which is '
                                    f'already assigned to {self.dtype_series[dtype_alias]}')
                self.dtype_series[dtype_alias] = klass

        self.db_type_to_dtype: Dict[str, str] = {}
        for klass in base_types:
            db_dtype = klass.db_dtype
            if db_dtype in self.db_type_to_dtype:
                raise Exception(f'Type {klass} claims db_dtype {db_dtype}, which is '
                                f'already assigned to {self.db_type_to_dtype[db_dtype]}')
            self.db_type_to_dtype[db_dtype] = klass

        # note that order can be important here. value_to_dtype starts at end of this list and for example a
        # bool can become and 'int64' if int would be later in this list.
        self.value_type_dtype = [
            (int,                BuhTuhSeriesInt64.dtype),
            (numpy.int64,        BuhTuhSeriesInt64.dtype),
            (float,              BuhTuhSeriesFloat64.dtype),
            (bool,               BuhTuhSeriesBoolean.dtype),
            (str,                BuhTuhSeriesString.dtype),

            (datetime.date,      BuhTuhSeriesDate.dtype),
            (datetime.time,      BuhTuhSeriesTime.dtype),
            (datetime.datetime,  BuhTuhSeriesTimestamp.dtype),

            (datetime.timedelta, BuhTuhSeriesTimedelta.dtype),
            (numpy.timedelta64,  BuhTuhSeriesTimedelta.dtype)
        ]

    def register_dtype_series(self,
                              dtype: str,
                              series_type: Type['BuhTuhSeries'],
                              value_types: List[Type]):
        """ TODO: comments"""
        self._real_init()
        # todo: use dtypes consistently, so we don't have to lower() it in some places
        dtype = dtype.lower()
        self.dtype_series[dtype] = series_type
        for value_type in value_types:
            self.value_type_dtype.append((value_type, dtype))

    def get_series_type_from_dtype(self, dtype: str) -> Type['BuhTuhSeries']:
        self._real_init()
        # todo: use dtypes consistently, so we don't have to lower() it in some places
        dtype = dtype.lower()
        if dtype not in self.dtype_series:
            raise ValueError(f'Unknown dtype: {dtype}')
        return self.dtype_series[dtype]

    def value_to_dtype(self, value: Any) -> str:
        """
        Given a python value, return the dtype of the BuhTuhSeries that's registered as the default
        for the type of value.
        """
        self._real_init()
        # exception for values that are BuhTuhSeries. Check: do we need this exception?
        from buhtuh.pandasql import BuhTuhSeries
        if isinstance(value, BuhTuhSeries):
            # todo: use dtypes consistently, so we don't have to lower() it in some places
            return value.dtype.lower()
        # iterate in reverse, the last item added that matches is used in case where multiple entries
        # match.
        for type_object, dtype in self.value_type_dtype[::-1]:
            if isinstance(value, type_object):
                return dtype
        raise ValueError(f'No dtype know for {type(value)}')


_registry = TypeRegistry()
