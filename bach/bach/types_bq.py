"""
Copyright 2022 Objectiv B.V.

Functions for parsing data-type strings from BigQuery to our representation for instance-dtypes
"""
from typing import Mapping, List, Tuple

from bach.types import StructuredDtype, Dtype, get_all_db_dtype_to_series
from sql_models.constants import DBDialect


def bq_db_dtype_to_dtype(db_dtype: str) -> StructuredDtype:
    """
    Given a db_dtype as returned by BigQuery, parse this to an instance-dtype.

    Note: We don't yet support Structs with unnamed fields (e.g. 'STRUCT<INT64>' is not supported.

    :param db_dtype: BigQuery db-dtype, e.g. 'STRING', or 'STRUCT<column_name INT64>', etc
    :return: Instance dtype
    """
    print()
    print(db_dtype)
    print()
    bq_db_dtype_to_series = get_all_db_dtype_to_series()[DBDialect.BIGQUERY]
    scalar_mapping = {db_dtype: series.dtype for db_dtype, series in bq_db_dtype_to_series.items()}

    tokens = _tokenize(db_dtype)
    pos, result = _tokens_to_dtype(tokens=tokens, pos=0, scalar_mapping=scalar_mapping)
    if pos != len(tokens) - 1:
        raise ValueError(f'Unexpected tokens after last parsed tokens. '
                         f'Last parsed tokens position: {pos}, total tokens: {len(tokens)}')
    return result


def _tokenize(p):
    """ TODO: comments """
    tokens = []
    token = []

    i = iter(p.strip())
    c = next(i, None)
    while c:
        while c and c not in '<>,':
            token.append(c)
            c = next(i, None)

        # process the token
        t = "".join(token).strip()
        token = []
        if len(t):
            if ' ' in t:
                # This is the format '<identifier> <type>'
                # TODO: what if identifier_str is something that is quoted? is that possible?
                identifier_str, type_str, *too_many = t.split(' ')
                if too_many:
                    raise ValueError('Cannot tokenize string: "{t}", expected only one space.')
                tokens.extend([identifier_str, ' ', type_str])
            else:
                tokens.append(t)
        if c:
            tokens.append(str(c))
            c = next(i, None)

    return tokens


def _tokens_to_dtype(
    tokens: List[str],
    pos: int,
    scalar_mapping: Mapping[str, Dtype]
) -> Tuple[int, StructuredDtype]:
    """
    TODO: comments
    :return: tuple: position of the last processed token, parsed dtype
    """
    t = get_token(tokens, pos)
    if t == 'STRUCT':
        # Recursive case: get type of elements in struct
        pos += 1
        assert_token(tokens, pos, '<')
        current = {}
        while (pos + 1) < len(tokens):
            pos += 1
            if get_token(tokens, pos) == '>':
                break
            elif get_token(tokens, pos) == ',':
                continue
            else:
                # parse a sub type
                if get_token(tokens, pos + 1) == ' ':
                    # format: `name TYPE`
                    name = get_token(tokens, pos)
                    pos, sub_dtype = _tokens_to_dtype(tokens, pos=pos + 2, scalar_mapping=scalar_mapping)
                    current[name] = sub_dtype
                else:
                    # format: `TYPE`
                    raise ValueError('Dont support this for now TODO')
        assert_token(tokens, pos, '>')
        return pos, current
    if t == 'ARRAY':
        # Recursive case: get type of elements in array
        assert_token(tokens, pos + 1, '<')
        pos, sub_dtype = _tokens_to_dtype(tokens, pos=pos + 2, scalar_mapping=scalar_mapping)
        assert_token(tokens, pos + 1, '>')
        return pos + 1, [sub_dtype]

    if t in scalar_mapping:
        # Base case: simple type
        return pos, scalar_mapping[t]

    raise ValueError(f'Unexpected token: "{t}" on position: {pos}')


def get_token(tokens: List[str], pos: int) -> str:
    if pos >= len(tokens):
        raise ValueError(f'Expected token on position {pos}, but found no token. '
                         f'len(tokens) = {len(tokens)}. Tokens: {tokens}')
    return tokens[pos]


def assert_token(tokens: List[str], pos: int, expected: str):
    """ Assert that character on pos in tokens is the expected value, if not raise an ValueError. """
    if pos >= len(tokens):
        raise ValueError(f'Expected token "{expected}" on position {pos}, but found no token. '
                         f'len(tokens) = {len(tokens)}. Tokens: {tokens}')
    if tokens[pos] != expected:
        raise ValueError(f'Expected token "{expected}" on position {pos}, but found: {tokens[pos]}. '
                         f'Tokens: {tokens}')
