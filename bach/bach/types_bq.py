"""
Copyright 2022 Objectiv B.V.
"""
from typing import Mapping, List, Tuple

from bach.types import StructuredDtype, Dtype


def bq_db_dtype_to_dtype(db_dtype: str, scalar_mapping: Mapping[str, Dtype]) -> StructuredDtype:
    """
    TODO: comments
    """
    tokens = _tokenize(db_dtype)
    pos, result = _tokens_to_dtype(tokens=tokens, pos=0, scalar_mapping=scalar_mapping)
    if pos != len(tokens) - 1:
        raise ValueError(f'Unexpected tokens after last parsed tokens.'
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
                # This is the format '<name> <type>'
                # TODO: what if identifier_str is something that is quoted? is that possible?
                identifier_str, type_str = t.split(' ')
                tokens.extend([identifier_str, ' ', type_str])
            else:
                tokens.append(t)
        if c:
            tokens.append(str(c))
            c = next(i, None)

    print(tokens)
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
    # if pos >= len(tokens) we are parsing a malformed string. let error rise up for now
    t = tokens[pos]
    if t == 'STRUCT':
        # Recursive case: get type of elements in struct
        pos += 1
        assert_token(tokens, pos, '<')
        current = {}
        while pos < len(tokens):
            pos += 1
            if tokens[pos] == '>':
                break
            elif tokens[pos] == ',':
                continue
            else:
                # parse a sub type
                if tokens[pos + 1] == ' ':
                    # format: `name TYPE`
                    name = tokens[pos]
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

    raise ValueError(f'Unexpected token: {t} on position: {pos}')


def assert_token(tokens: List[str], pos: int, expected: str):
    """ Assert that character on pos in tokens is the expected value, if not raise an ValueError. """
    if tokens[pos] != expected:
        raise ValueError(f'Expected token "{expected}" on position: {pos}, but found: {tokens[pos]}. '
                         f'Tokens: {tokens}')
