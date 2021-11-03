"""
Copyright 2021 Objectiv B.V.
"""
from typing import Union, TYPE_CHECKING

from bach.series import Series
from bach.expression import Expression

if TYPE_CHECKING:
    from bach.series import SeriesBoolean


class SeriesString(Series):
    dtype = 'string'
    dtype_aliases = ('text', str)
    supported_db_dtype = 'text'
    supported_value_types = (str, )

    @classmethod
    def supported_value_to_expression(cls, value: str) -> Expression:
        return Expression.string_value(value)

    @classmethod
    def dtype_to_expression(cls, source_dtype: str, expression: Expression) -> Expression:
        if source_dtype == 'string':
            return expression
        return Expression.construct('cast(({}) as text)', expression)

    def __add__(self, other) -> 'Series':
        return self._binary_operation(other, 'concat', '({}) || ({})', other_dtypes=['string'])

    def _comparator_operation(self, other, comparator, other_dtypes=['string']) -> 'SeriesBoolean':
        return super()._comparator_operation(other, comparator, other_dtypes)

    def slice(self, start: Union[int, slice], stop: int = None) -> 'SeriesString':
        """
        Get a python string slice using DB functions. Format follows standard slice format
        Note: this is called 'slice' to not destroy index selection logic
        :param item: an int for a single character, or a slice for some nice slicing
        :return: SeriesString with the slice applied
        """
        if isinstance(start, (int, type(None))):
            item = slice(start, stop)
        elif isinstance(start, slice):
            item = start
        else:
            raise ValueError(f'Type not supported {type(start)}')

        expression = self.expression

        if item.start is not None and item.start < 0:
            expression = Expression.construct(f'right({{}}, {abs(item.start)})', expression)
            if item.stop is not None:
                if item.stop < 0 and item.stop > item.start:
                    # we needed to check stop < 0, because that would mean we're going the wrong direction
                    # and that's not supported
                    expression = Expression.construct(f'left({{}}, {item.stop - item.start})', expression)
                else:
                    expression = Expression.construct("''")

        elif item.stop is not None and item.stop < 0:
            # we need to get the full string, minus abs(stop) chars.
            expression = Expression.construct(
                f'substr({{}}, 1, greatest(0, length({{}}){item.stop}))',
                expression, expression
            )

        else:
            # positives only
            if item.stop is None:
                if item.start is None:
                    # full string, what are we doing here?
                    # current expression is okay.
                    pass
                else:
                    # full string starting at start
                    expression = Expression.construct(f'substr({{}}, {item.start+1})', expression)
            else:
                if item.start is None:
                    expression = Expression.construct(f'left({{}}, {item.stop})', expression)
                else:
                    if item.stop > item.start:
                        expression = Expression.construct(
                            f'substr({{}}, {item.start+1}, {item.stop-item.start})',
                            expression
                        )
                    else:
                        expression = Expression.construct("''")

        return self.copy_override(dtype='string', expression=expression)
