"""
Copyright 2021 Objectiv B.V.
"""
__version__ = '0.0.4'

from modelhub.modelhub import ModelHub
from modelhub.aggregate import Aggregate
from modelhub.map import Map
from modelhub.stack import *
from modelhub.series import *

import os

if os.environ.get('OBJECTIV_VERSION_CHECK_DISABLE', 'false') == 'false':
    import warnings
    import asyncio
    import aiohttp

    from bach import __version__ as bach_version

    CHECK_URL = os.environ.get('OBJECTIV_VERSION_CHECK_URL',
                               'https://version-check.objectiv.io/check_version')
    # CHECK_URL = 'http://localhost:8000/check_version'

    async def check_package_version():
        packages = [
                f'objectiv-bach:{bach_version}',
                f'objectiv-modelhub:{__version__}'
        ]

        data = '\n'.join(packages)

        try:
            # set timeout to 10 seconds
            timeout = aiohttp.ClientTimeout(total=100)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(CHECK_URL, data=data) as resp:
                    status = resp.status
                    if status == 200:
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
        except Exception as e:
            # if this fails, we don't want to know
            # pass
            print(f'exception caught: {e}')

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError as re:
        loop = asyncio.new_event_loop()

    if loop:
        loop.create_task(check_package_version())
