"""Stream type classes for tap-optimize."""

from pathlib import Path
from typing import Any, Dict, Optional, Union, List, Iterable

from singer_sdk import typing as th  # JSON Schema typing helpers

from tap_optimize.client import OptimizeStream

# TODO: Delete this is if not using json files for schema definition
SCHEMAS_DIR = Path(__file__).parent / Path("./schemas")

class OptimizeStream (OptimizeStream):
    name = 'optimize'
    primary_keys = ['experiment_id', 'variant_id']
    schema_filepath = SCHEMAS_DIR / 'optimize.json'
