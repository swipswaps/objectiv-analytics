ARG TAG=latest

FROM ubuntu:20.04
# Step 1: get a python environment setup
ENV DEBIAN_FRONTEND=noninteractive
RUN \
	apt -y -q update && \
	apt -q -y install python3.8 virtualenv curl && \
	apt -y autoremove && \
	apt clean && \
	rm -rf /var/lib/apt/lists/* && \
	mkdir -p /services && \
	virtualenv -p python3 /services/venv
WORKDIR /services

# Step 2: Customize image for our use

ARG VERSION
RUN test -n "$VERSION" || (echo "Make sure to set the VERSION argument when building the container"; exit 1)
ENV PYTHON_PACKAGE_FILE=objectiv_backend-${VERSION}-py3-none-any.whl

RUN \
    mkdir -p /services/jsons/OK/ && \
    mkdir -p /services/jsons/NOK/ && \
    chown -R www-data /services/jsons

# entrypoint scripts
COPY docker/*.sh /services/
COPY docker/gunicorn.conf.py /etc/

# python requirements
COPY requirements.txt /services/

RUN \
    . venv/bin/activate && \
    pip install gunicorn && \
    pip install -r requirements.txt

# Install the objectiv-backend package
COPY dist/${PYTHON_PACKAGE_FILE} /tmp/${PYTHON_PACKAGE_FILE}
RUN . venv/bin/activate && \
    pip install /tmp/${PYTHON_PACKAGE_FILE} && \
    rm /tmp/${PYTHON_PACKAGE_FILE}
