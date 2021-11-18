FROM python:3.9

ENV DEBIAN_FRONTEND=non-interactive

ENV APP=/services/notebooks/

RUN mkdir -p $APP && \
    apt -q update && \
    apt -qy upgrade && \
    apt -qy install postgresql-client && \
    python3 -m venv /services/venv && \
    . /services/venv/bin/activate && \
    python -m pip install --upgrade pip && \
    adduser notebook

COPY analysis/docker/*.sql  /services
COPY analysis/docker/requirements.txt /services
COPY analysis/objectiv_bach/*.whl /services
COPY bach/*.whl /services

RUN . /services/venv/bin/activate && \
    cd /services && \
    pip install -r requirements.txt && \
    pip install /services/*.whl

COPY analysis/docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

COPY analysis/notebooks/*.ipynb $APP


USER notebook
ENTRYPOINT /entrypoint.sh
