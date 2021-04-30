"""
Copyright 2021 Objectiv B.V.
"""

# Custom Schema Extensions to load
import os

# Custom Schema Extensions to load
SCHEMA_EXTENSION_EVENT = os.environ.get('SCHEMA_EXTENSION_EVENT')
SCHEMA_EXTENSION_CONTEXT = os.environ.get('SCHEMA_EXTENSION_CONTEXT')

# Maximum number of events that a worker will process in a single batch
WORKER_BATCH_SIZE = 200
# Time to sleep, if there is no work to do for the workers
WORKER_SLEEP_SECONDS = 5
