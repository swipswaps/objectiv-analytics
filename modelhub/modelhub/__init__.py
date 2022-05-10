"""
Copyright 2021 Objectiv B.V.
"""
__version__ = '0.0.4'

from modelhub.modelhub import ModelHub
from modelhub.aggregate import Aggregate
from modelhub.map import Map
from modelhub.stack import *
from modelhub.series import *

# we need this to check the environment variables
import os

# check env for opt-out setting
if os.environ.get('OBJECTIV_VERSION_CHECK_DISABLE', 'false') == 'false':
    try:
        # wrap the import in try/except to make sure we don't fail if there are missing imports
        import warnings
        import asyncio
        import aiohttp

        from bach import __version__ as bach_version

        CHECK_URL = os.environ.get('OBJECTIV_VERSION_CHECK_URL',
                                   'https://version-check.objectiv.io/check_version')

        async def check_package_version():
            packages = [
                    f'objectiv-bach:{bach_version}',
                    f'objectiv-modelhub:{__version__}'
            ]

            data = '\n'.join(packages)
            try:
                # set timeout to 0.5 seconds
                timeout = aiohttp.ClientTimeout(total=0.5)
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.post(CHECK_URL, data=data) as resp:

                        status = resp.status
                        if status == 200:
                            lines = await resp.text()
                            for line in lines.split('\n'):
                                items = line.split(':')
                                if len(items) == 3:
                                    package, updated, version = items
                                    # this is a line containing package:updated:version
                                    if updated == 'True':
                                        message = f'Update available for {package} to {version}'
                                        warnings.warn(category=Warning, message=message)
            except Exception as e:
                # if this fails, we don't want to know
                pass
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(check_package_version())
        except RuntimeError as re:
            try:
                loop = asyncio.new_event_loop()
                loop.run_until_complete(check_package_version())
            except Exception as e:
                pass
    except ModuleNotFoundError:
        # this can only happen if asyncio or aiohttp are not present
        pass
