FROM jupyter/datascience-notebook

RUN pip install psycopg2-binary sqlalchemy && \
    conda update -n base conda && \
    conda install psycopg2  sqlalchemy

# TODO: do we need this? Not having this will result in a warning
ARG TAG
