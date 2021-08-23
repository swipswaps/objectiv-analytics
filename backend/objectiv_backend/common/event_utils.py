"""
Copyright 2021 Objectiv B.V.
"""
from typing import Dict, Any, Optional, List, cast

from objectiv_backend.common.types import EventData, ContextType
from objectiv_backend.schema.schema import AbstractContext, AbstractLocationContext, AbstractGlobalContext, make_context


def get_optional_context(event: EventData, context_type: ContextType) -> Optional[AbstractContext]:
    """ Get the first Context of the given type, or None if there is none. """
    result = get_contexts(event=event, context_type=context_type)
    if not result:
        return None
    return result[0]


def get_context(event: EventData, context_type: ContextType) -> AbstractContext:
    """ Get the first Context of the given type. """
    result = get_contexts(event=event, context_type=context_type)
    if not result:
        raise ValueError(f'context-type {context_type} not present in event. data: {event}')
    return result[0]


def get_contexts(event: EventData, context_type: ContextType) -> List[AbstractContext]:
    """ Given all the Contexts of the given type."""
    contexts = get_global_contexts(event) + get_location_stack(event)
    result = []
    for context in contexts:
        if context.__class__.__name__ == context_type:
            result.append(context)
    return result


def get_global_contexts(event: EventData) -> List[AbstractGlobalContext]:
    """ Given an event, return all global contexts (if any)."""
    return event.get("global_contexts", [])


def get_location_stack(event: EventData) -> List[AbstractLocationContext]:
    """ Given an event, return the location stack (location contexts)."""
    return event.get("location_stack", [])


def add_global_context_to_event(event: EventData, context: AbstractGlobalContext) -> Dict[str, Any]:
    """ Add the global context to the event. Returns the modified event """
    event['global_contexts'].append(context)
    return event


def event_add_construct_context(event: EventData,
                                context_type: ContextType,
                                context_id: str,
                                **kwargs) -> EventData:
    """
    Create a new Context, and add that to the Event.
    :return: The modified Event.
    """

    context = make_context(_context_type=context_type, id=context_id, **kwargs)
    return add_global_context_to_event(event, context)
