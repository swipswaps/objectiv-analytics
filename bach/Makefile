.PHONY: tests

tests:
	mypy --check-untyped-defs bach sql_models
	pycodestyle bach sql_models
	pytest tests/ -W error::DeprecationWarning
