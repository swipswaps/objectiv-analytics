.PHONY=all clean python-dist docker-image

# All (sub) directories with python files that are relevant for the python package.
# If a file in any of these directories changes then we want to rebuild the package.
PYTHON_DIRECTORIES=$(shell find objectiv_backend -type d)

OBJ_PACKAGE_VERSION ?= 0.0.1
PACKAGE_NAME = dist/objectiv_backend-$(OBJ_PACKAGE_VERSION)-py3-none-any.whl
TAG ?= latest

all: docker-image python-dist

docker-image:
	docker build \
	--build-arg VERSION=$(OBJ_PACKAGE_VERSION) \
	-t objectiv/backend:$(TAG) -f docker/Dockerfile .

# `python-dist` will build the docker image locally
# `clean` will remove it again
python-dist: $(PACKAGE_NAME)

$(PACKAGE_NAME): $(PYTHON_DIRECTORIES)
	echo $(OBJ_PACKAGE_VERSION) > objectiv_backend/VERSION
	python3 -m build --wheel

clean:
	rm $(PACKAGE_NAME)
