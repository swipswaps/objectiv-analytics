ARG TAG=latest
FROM objectiv/python3:${TAG}

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
