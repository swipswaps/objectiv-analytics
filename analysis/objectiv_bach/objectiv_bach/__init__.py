"""
Copyright 2021 Objectiv B.V.
"""
__version__ = '0.0.1'

from objectiv_bach.series import *
from objectiv_bach.stack.util import basic_feature_model
from bach.types import _registry

# automatically register our own types
# TODO use proper decorator for this.
_registry.register_dtype_series(SeriesGlobalContexts, [], override_registered_types=True)
_registry.register_dtype_series(SeriesLocationStack, [], override_registered_types=True)
