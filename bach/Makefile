.PHONY: tests

tests:
	mypy --check-untyped-defs bach sql_models
	pycodestyle bach sql_models
	pytest tests/ -W error::DeprecationWarning


tests-bigquery:
# Run tests not only against Postgres, but also against Big Query (in so far supported by tests)
	mypy --check-untyped-defs bach sql_models
	pycodestyle bach sql_models
	pytest --big-query tests/unit tests/functional -W error::DeprecationWarning


tests-all:
# Run tests not only against Postgres, but also against Big Query (in so far supported by tests)
	mypy --check-untyped-defs bach sql_models
	pycodestyle bach sql_models
	pytest --all tests/unit tests/functional -W error::DeprecationWarning
