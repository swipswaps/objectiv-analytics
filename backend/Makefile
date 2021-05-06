.PHONY=all clean python-dist docker-image

# Targets:
# docker-image: Build docker image that includes installed python package. Only dependency is docker
# python-dist:  Build python package locally
# clean:        Remove python package build by python-dist

# All (sub) directories with python files that are relevant for the python package.
# If a file in any of these directories changes then we want to rebuild the package.
PYTHON_DIRECTORIES=$(shell find objectiv_backend -type d)

# The name of the python package we'll build depends on the version
OBJ_PACKAGE_VERSION = $(shell cat objectiv_backend/VERSION)
PACKAGE_NAME = dist/objectiv_backend-$(OBJ_PACKAGE_VERSION)-py3-none-any.whl

# tag of the container image we'll build
TAG ?= latest

all: docker-image python-dist

docker-image:
	docker build -t objectiv/backend:$(TAG) -f docker/Dockerfile .

python-dist: $(PACKAGE_NAME)

$(PACKAGE_NAME): $(PYTHON_DIRECTORIES)
	python3 -m build --wheel

clean:
	rm $(PACKAGE_NAME)
