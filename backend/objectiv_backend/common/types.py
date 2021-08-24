"""
Copyright 2021 Objectiv B.V.
"""
import uuid
from enum import Enum
from typing import NamedTuple, Union, Dict, Any

ContextData = Dict[str, Union[str, int, float]]

EventType = str
ContextType = str


class FailureReason(Enum):
    # values match the values of the failure_reason type in the database
    FAILED_VALIDATION = 'failed validation'
    DUPLICATE = 'duplicate'
