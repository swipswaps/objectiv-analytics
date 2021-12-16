#!/bin/bash

# load virtualenv
source /services/venv/bin/activate

# wait a bit to give PG a chance to start up
sleep 10
for sql in /services/*.sql
do
  echo "Loading data from $sql into $POSTGRES_HOSTNAME/$database"
  cat $sql | psql -U $POSTGRES_USER -h $POSTGRES_HOSTNAME $POSTGRES_DATABASE
done

# init db
export DSN="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOSTNAME}/${POSTGRES_DB}"

# start notebook
# disable TOKEN
export JUPYTER_TOKEN=objectiv
jupyter lab --notebook-dir /services/notebooks --no-browser --ip 0.0.0.0
