"""Optimize tap class."""

from typing import List

from singer_sdk import Tap, Stream
from singer_sdk import typing as th  # JSON schema typing helpers

from tap_optimize.streams import (
    OptimizeStream
)
STREAM_TYPES = [OptimizeStream]



class TapOptimize(Tap):
    """Optimize tap class."""
    name = "tap-optimize"

    config_jsonschema = th.PropertiesList(
        th.Property("service_account", th.StringType, required=True),
        th.Property("view_id", th.StringType, required=True),
        th.Property("start_date", th.DateTimeType)
    ).to_dict()

    def discover_streams(self) -> List[Stream]:
        """Return a list of discovered streams."""
        return [stream(tap=self) for stream in STREAM_TYPES]
