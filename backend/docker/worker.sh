#!/bin/sh

. venv/bin/activate
export PYTHONPATH=.:$PYTHONPATH

# run worker process in loop
echo "starting"
objectiv-workers all --loop

# alternative:
# python -m objectiv_backend.workers.workers all --loop
