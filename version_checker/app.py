import uuid
import os

from flask import Flask, Response, Request
import flask
from flask_cors import CORS
import json


import semver
import requests

from typing import Generator, Dict
import time

from objectiv_backend.schema.schema import make_event_from_dict, AbstractEvent


TRACKER_URL = os.environ.get('TRACKER_URL', 'http://localhost:8081')


def get_current_version(package: str) -> str:
    return '0.0.5'

    url = f'https://pypi.org/pypi/{package}/json'
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.get(url=url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        if 'info' in data and 'version' in data['info']:
            # only return version if everything went OK, otherwise, too bad!
            return data['info']['version']

    return None


def parse_payload(request: Request) -> Generator:
    payload = request.data.decode('utf-8')
    for line in payload.split('\n'):

        terms = line.split(':')
        if len(terms) > 1:
            yield {
                'name': terms[0].strip(),
                'version': terms[1].strip()
            }


def check_version() -> Response:
    packages_to_check = ['objectiv-bach', 'objectiv-modelhub']

    request: Request = flask.request

    data = parse_payload(request)
    packages = {}
    if data:
        for package in data:
            if package['name'] not in packages_to_check:
                continue
            current_version = get_current_version(package=package['name'])

            update_available = semver.compare(current_version, package['version']) > 0
            packages[package['name']] = {
                    'update': update_available,
                    'current_version': current_version,
                    'local_version': package['version']}

    response = []
    if packages:
        # only try to track if this request contains a valid payload
        event = make_event(request=request, packages=packages)
        try:
            track_event(event)
        except requests.exceptions.RequestException as re:
            # this shouldn't happen, but we continue, as we can still return version info
            print(f'Could not send event: {re}')
    else:
        response.append('error:Could not process request')

    for package in packages:
        update = packages[package]['update']
        current_version = packages[package]['current_version']
        response.append(f'{package}:{update}:{current_version}')

    return Response(mimetype='application/text', status=200, response='\n'.join(response))


def make_event(request: Request, packages: Dict[str, str]) -> AbstractEvent:
    user_agent = str(request.user_agent)

    for package in packages:
        if package == 'objectiv-modelhub':
            version = packages[package]['local_version']
            user_agent += f' {package}/{version}'

    event_data = {
        '_type': 'ApplicationLoadedEvent',
        'id': str(uuid.uuid4()),
        'global_contexts': [
            {
                '_type': 'HttpContext',
                'id': 'http_context',
                'referrer': '',
                'user_agent': user_agent,
                'remote_address': request.remote_addr
            },
            {
                '_type': 'ApplicationContext',
                'id': 'BachVersionChecker'
            }
        ],
        'location_stack': [],
        'time': int(time.time()*1000)
    }
    return make_event_from_dict(event_data)


def track_event(event: AbstractEvent):

    headers = {
        'Content-Type': 'application/json'
    }
    data = {
        'events': [event],
        'transport_time': int(time.time()*1000)
    }
    requests.post(TRACKER_URL, data=json.dumps(data), headers=headers)


def create_app() -> Flask:

    flask_app = flask.Flask(__name__, static_folder=None)  # type: ignore
    flask_app.add_url_rule(rule='/check_version', view_func=check_version, methods=['POST'])
    CORS(flask_app,
         resources={r'/*': {
             'origins': '*',
             # Setting max_age to a higher values is probably useless, as most browsers cap this time.
             # See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age
             'max_age': 3600 * 24
         }})
    return flask_app


app = create_app()
