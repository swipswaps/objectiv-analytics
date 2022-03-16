.PHONY: tests

tests:
	mypy modelhub
	pycodestyle modelhub
	pytest modelhub -W error::DeprecationWarning
