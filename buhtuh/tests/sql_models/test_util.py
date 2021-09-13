"""
Copyright 2021 Objectiv B.V.
"""
from sql_models.util import extract_format_fields


def test_extract_format_fields():
    assert extract_format_fields('{test}') == {'test'}
    assert extract_format_fields('{test} more text {test}') == {'test'}
    assert extract_format_fields('text{test} more {{text}} {test2} te{x}t{test}') == {'test', 'test2', 'x'}


def test_extract_format_fields_nested():
    # assert extract_format_fields('{test}', 2) == set()
    # assert extract_format_fields('{test} more text {test}', 2) == set()
    # assert extract_format_fields('text{test} more {{text}} {test2} te{x}t{test}', 2) == {'text'}
    assert extract_format_fields('{x} {{y}} {{{{z}}}} {a}', 1) == {'x', 'a'}
    assert extract_format_fields('{x} {{y}} {{{{z}}}} {a}', 2) == {'y'}
    assert extract_format_fields('{x} {{y}} {{{{z}}}} {a}', 3) == {'z'}
    assert extract_format_fields('{x} {{y}} {{{{z}}}}', 3) == {'z'}
