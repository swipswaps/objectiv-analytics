"""
Copyright 2021 Objectiv B.V.
"""
from sql_models.util import extract_format_fields, quote_identifier, quote_string


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


def test_quote_identifier():
    assert quote_identifier('test') == '"test"'
    assert quote_identifier('te"st') == '"te""st"'
    assert quote_identifier('"te""st"') == "\"\"\"te\"\"\"\"st\"\"\""


def test_quote_string():
    assert quote_string("test") == "'test'"
    assert quote_string("te'st") == "'te''st'"
    assert quote_string("'te''st'") == "'''te''''st'''"
