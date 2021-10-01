from typing import Type, Tuple, Any, TypeVar, List, TYPE_CHECKING, Dict, Hashable, cast
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


def value_to_dtype(value: Any) -> str:
    """
    Give the dtype, as a string of the given value.
    """
    return _registry.value_to_dtype(value)


T = TypeVar('T', bound='BuhTuhSeries')


def register_dtype(value_types: List[Type] = None, override_dtypes: bool = False):
    """
    Decorator to register a BuhTuhSeries subclass as dtype series
    :value_types: List of Types for which values should be instantiated as the registered class
    :override_dtypes: If the class' dtype or db_dtype conflict with existing registerd types.
    """
    if value_types is None:
        value_types = []

    def wrapper(cls: Type[T]) -> Type[T]:
        # Mypy needs some help here
        assert value_types is not None
        _registry.register_dtype_series(cls, value_types, override_dtypes)
        return cls
    return wrapper


class TypeRegistry:
    def __init__(self):
        # Do the real initialisation in _real_init, which we'll defer until usage so we won't get
        # problems with cyclic imports.

        # dtype_series: Mapping of dtype to a subclass of BuhTuhSeries
        self.dtype_to_series: Dict[Hashable, Type['BuhTuhSeries']] = {}

        # value_type_dtype: Mapping of python types to matching dtype
        # note that some types could be in this dictionary multiple times. For a subtype its super types
        # might also be in the list. We resolve conflicts in arg_to_type by returning the latest matching
        # entry.
        self.value_type_to_dtype: List[Tuple[Type, str]] = []

        # db_type_to_dtype: Mapping of Postgres types to a subclass of BuhTuhSeries
        self.db_dtype_to_series: Dict[str, Type['BuhTuhSeries']] = {}

    def _real_init(self):
        """
        Load the default dtype and value-type mappings.
        The dtype_series mapping will be based on the dtype and dtype_aliases that the base BuhTuhSeries
            declare
        The value to dtype is hardcoded here for the base classes
        """
        if self.dtype_to_series or self.value_type_to_dtype or self.db_dtype_to_series:
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

        for klass in base_types:
            self._register_dtype_klass(klass)
            self._register_db_dtype_klass(klass)

        # For the value_type_to_dtype list order can be important. The value_to_dtype() function starts at
        # end of this list and the first matching entry determines the return value.
        # A type might match multiple entries in the list, because it can be an instance of multiple (super)
        # classes. E.g. a `bool` is also an `int`
        # Therefore this list is hardcoded here, and not automatically derived from the base_types classes
        # (yet) TODO?
        self.value_type_to_dtype = [
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

    def _register_dtype_klass(self, klass: Type['BuhTuhSeries'], override=False):
        dtype_and_aliases: List[Hashable] = [klass.dtype] + list(klass.dtype_aliases)  # type: ignore
        for dtype_alias in dtype_and_aliases:
            if dtype_alias in self.dtype_to_series and not override:
                raise Exception(f'Type {klass} claims dtype (or dtype alias) {dtype_alias}, which is '
                                f'already assigned to {self.dtype_to_series[dtype_alias]}')
            self.dtype_to_series[dtype_alias] = klass

    def _register_db_dtype_klass(self, klass: Type['BuhTuhSeries'], override=False):
        # TODO: do we even need this? We only use this in a test case it seems?
        if klass.db_dtype is None:
            return
        db_dtype = cast(str, klass.db_dtype)
        if db_dtype in self.db_dtype_to_series and not override:
            raise Exception(f'Type {klass} claims db_dtype {db_dtype}, which is '
                            f'already assigned to dtype {self.db_dtype_to_series[db_dtype]}')
        self.db_dtype_to_series[db_dtype] = klass

    def register_dtype_series(self,
                              series_type: Type['BuhTuhSeries'],
                              value_types: List[Type],
                              override_dtypes: bool = False):
        """
        Add a BuhTuhSeries sub-class to this registry.
        Will register the given series_type as the default type for its dtype and db_dtype
        """
        self._real_init()
        self._register_dtype_klass(series_type, override_dtypes)
        self._register_db_dtype_klass(series_type, override_dtypes)
        dtype = cast(str, series_type.dtype)
        for value_type in value_types:
            self.value_type_to_dtype.append((value_type, dtype))

    def get_series_type_from_dtype(self, dtype: str) -> Type['BuhTuhSeries']:
        """
        Given a dtype string, will return the correct BuhTuhSeries object to represent such data.
        """
        self._real_init()
        if dtype not in self.dtype_to_series:
            raise ValueError(f'Unknown dtype: {dtype}')
        return self.dtype_to_series[dtype]

    def get_series_type_from_db_dtype(self, db_dtype: str) -> Type['BuhTuhSeries']:
        """
        Given a db_dtype string, will return the correct BuhTuhSeries object to represent such data from the
        database..
        """
        self._real_init()
        if db_dtype not in self.db_dtype_to_series:
            raise ValueError(f'Unknown db_dtype: {db_dtype}')
        return self.db_dtype_to_series[db_dtype]

    def value_to_dtype(self, value: Any) -> str:
        """
        Given a python value, return the dtype string of the BuhTuhSeries that's registered as the default
        for the type of value.
        """
        self._real_init()
        # exception for values that are BuhTuhSeries. Check: do we need this exception?
        from buhtuh.pandasql import BuhTuhSeries
        if isinstance(value, BuhTuhSeries):
            return value.dtype
        # iterate in reverse, the last item added that matches is used in case where multiple entries
        # match.
        for type_object, dtype in self.value_type_to_dtype[::-1]:
            if isinstance(value, type_object):
                return dtype
        raise ValueError(f'No dtype know for {type(value)}')


_registry = TypeRegistry()
