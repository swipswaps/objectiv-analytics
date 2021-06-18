.PHONY: all clean python-package docker-image tests base_schema

# Targets:
# docker-image:   Build docker image that includes installed python package. Only dependency is docker
# python-package: Build python package locally
# clean:          Remove python package built by python-package

# All (sub) directories with python files that are relevant for the python package.
# If a file in any of these directories changes then we want to rebuild the package.
PYTHON_DIRECTORIES=$(shell find objectiv_backend -type d)

# The name of the python package we'll build depends on the version
OBJ_PACKAGE_VERSION = $(shell cat objectiv_backend/VERSION)
PACKAGE_NAME = dist/objectiv_backend-$(OBJ_PACKAGE_VERSION)-py3-none-any.whl

SCHEMA_SOURCE_DIR=../schema
SCHEMA_TARGET_DIR=objectiv_backend/schema
SCHEMA_BASE_FILE=base_schema.json

# tag of the container image we'll build
TAG ?= latest

all: docker-image python-package

docker-image:
	docker build -t objectiv/backend:$(TAG) -f docker/Dockerfile .

python-package: $(PACKAGE_NAME)

# copy base schema into the scope of the python package
# we always do this, to make sure, we're not using old stuff
base_schema:
	cp -f ${SCHEMA_SOURCE_DIR}/${SCHEMA_BASE_FILE} ${SCHEMA_TARGET_DIR}

$(PACKAGE_NAME): base_schema $(PYTHON_DIRECTORIES)
	python3 -m build --wheel

clean:
	rm dist/*
	rm -r build
	rm ${SCHEMA_TARGET_DIR}/${SCHEMA_BASE_FILE}

tests:
	mypy objectiv_backend
	pytest tests

run: base_schema
	cd objectiv_backend && flask run