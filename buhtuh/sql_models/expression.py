"""
Copyright 2021 Objectiv B.V.
"""
from dataclasses import dataclass, field
from typing import List, Optional, Union, TYPE_CHECKING

if TYPE_CHECKING:
    from buhtuh import BuhTuhSeries


@dataclass(frozen=True)
class ExpressionToken:
    """ Abstract base class of ExpressionTokens"""

    def __post_init__(self):
        # Make sure that other code can rely on an ExpressionToken always being a subclass of this class.
        if self.__class__ == ExpressionToken:
            raise TypeError("Cannot instantiate ExpressionToken directly. Instantiate a subclass.")


@dataclass(frozen=True)
class Expression:
    """
    An Expression object represents a fragment of SQL as a series of sql-tokens.

    Expressions can easily be converted to a string with actual sql using the to_sql() function. Storing a
    sql-expression using this class, rather than storing it directly as a string, makes it possible to
    for example substitute the table-name after constructing the expression.
    Additionally this move this burden of correctly quoting and escaping string literals to this class, if
    literals are expressed with the correct tokens at least.
    In the future we might add support for more literal types.

    The implementation of ExpressionTokens is left to the module that is going to use this.
    """
    data: List[ExpressionToken] = field(default_factory=list)

    def to_sql(self, table_name: Optional[str] = None) -> str:
        raise NotImplementedError('to_sql() must be implemented')


def quote_string(value: str) -> str:
    """
    Add single quotes around the value and escape any quotes in the value.

    This is in accordance with the Postgres string notation format, no guarantees for other databses.
    See https://www.postgresql.org/docs/14/sql-syntax-lexical.html#SQL-SYNTAX-CONSTANTS

    Examples:
    >>> quote_string("test")
    "'test'"
    >>> quote_string("te'st")
    "'te''st'"
    >>> quote_string("'te''st'")
    "'''te''''st'''"
    """
    replaced_chars = value.replace("'", "''")
    return f"'{replaced_chars}'"


def quote_identifier(name: str) -> str:
    """
    Add quotes around an identifier (e.g. a table or column name), and escape special characters in the name.

    This is in accordance with the Postgres string notation format, no guarantees for other databses.
    See https://www.postgresql.org/docs/14/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS

    Examples:
    >>> quote_identifier('test')
    '"test"'
    >>> quote_identifier('te"st')
    '"te""st"'
    >>> quote_identifier('"te""st"')
    "\"\"\"te\"\"\"\"st\"\"\""
    """
    replaced_chars = name.replace('"', '""')
    return f'"{replaced_chars}"'
