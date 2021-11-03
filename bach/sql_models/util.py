"""
Copyright 2021 Objectiv B.V.
"""
import string
from typing import Set


def extract_format_fields(format_string: str, nested=1) -> Set[str]:
    """
    Given a python format string, return a set with all field names.

    If nested is set, it will do x rounds of:
        1. find field names in input string
        2. fill out values for field names. Use this as input string for step 1.

    Examples:
        extract_format_fields('{x} {{y}} {{{{z}}}} {a}', 1) == {'x', 'a'}
        extract_format_fields('{x} {{y}} {{{{z}}}} {a}', 2) == {'y'}
        extract_format_fields('{x} {{y}} {{{{z}}}} {a}', 3) == {'z'}
        extract_format_fields('{x} {{y}} {{{{z}}}}', 3)     == {'z'}
    """
    formatter = string.Formatter()
    fields = set()
    items = list(formatter.parse(format_string))
    for item in items:
        _literal_text, field_name, _format_spec, _conversion = item
        if field_name is not None:
            fields.add(field_name)
    if nested == 1:
        return fields
    dummy_values = {field_name: 'x' for field_name in fields}
    new_format_string = format_string.format(**dummy_values)
    return extract_format_fields(new_format_string, nested=nested-1)
