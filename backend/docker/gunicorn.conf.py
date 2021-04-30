import os
workers = os.environ.get('GUNICORN_WORKERS', 2)
host = os.environ.get('GUNICORN_HOST', 'localhost')
port = os.environ.get('GUNICORN_PORT', 5000)
bind = f'{host}:{port}'

