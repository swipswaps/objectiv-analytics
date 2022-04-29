"""
Copyright 2021 Objectiv B.V.
"""
__version__ = '0.0.4'

from modelhub.modelhub import ModelHub
from modelhub.aggregate import Aggregate
from modelhub.map import Map
from modelhub.stack import *
from modelhub.series import *

import warnings
import asyncio
import aiohttp

from bach import __version__ as bach_version


async def check_package_version():

    packages = [
            f'objectiv-bach: {bach_version}',
            f'objectiv-modelhub: {__version__}'
    ]

    data = '\n'.join(packages)

    async with aiohttp.ClientSession() as session:
        async with session.post('http://localhost:5000/check_version', data=data) as resp:
            lines = await resp.text()

            for line in lines.split('\n'):
                items = line.split(':')
                if len(items) == 3:
                    # this is a line containing package:updated:version
                    if items[1] == 'True':
                        package = items[0]
                        version = items[2]
                        message = f'Update available for {package} to {version}'
                        warnings.warn(category=Warning, message=message)

            return resp.status

loop = asyncio.get_event_loop()
loop.create_task(check_package_version())
