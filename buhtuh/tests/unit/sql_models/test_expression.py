from sql_models.expression import quote_string, quote_identifier


def test_quote_string():
    assert quote_string("test") == "'test'"
    assert quote_string("te'st") == "'te''st'"
    assert quote_string("'te''st'") == "'''te''''st'''"


def test_quote_identifier():
    assert quote_identifier('test') == '"test"'
    assert quote_identifier('te"st') == '"te""st"'
    assert quote_identifier('"te""st"') == "\"\"\"te\"\"\"\"st\"\"\""