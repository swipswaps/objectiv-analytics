"""
Copyright 2021 Objectiv B.V.
"""
import uuid
from typing import NamedTuple, Union, Dict, Any

EventData = Dict[str, Any]
ContextData = Dict[str, Union[str, int, float]]


class EventWithId(NamedTuple):
    id: uuid.UUID
    event: EventData
