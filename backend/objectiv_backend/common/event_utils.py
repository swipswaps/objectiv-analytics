"""
Copyright 2021 Objectiv B.V.
"""
from typing import Optional, List, Type

from objectiv_backend.common.types import ContextType
from objectiv_backend.schema.schema import AbstractEvent, AbstractContext, AbstractLocationContext, AbstractGlobalContext, make_context


def get_optional_context(event: AbstractEvent, context_type: Type[AbstractContext]) -> Optional[AbstractContext]:
    """ Get the first Context of the given type, or None if there is none. """
    result = get_contexts(event=event, context_type=context_type)
    if not result:
        return None
    return result[0]


def get_context(event: AbstractEvent, context_type: Type[AbstractContext]) -> AbstractContext:
    """ Get the first Context of the given type. """
    result = get_contexts(event=event, context_type=context_type)
    if not result:
        raise ValueError(f'context-type {context_type} not present in event. data: {event}')
    return result[0]


def get_contexts(event: AbstractEvent, context_type: Type[AbstractContext]) -> List[AbstractContext]:
    """ Given all the Contexts of the given type."""
    contexts = [*get_global_contexts(event), *get_location_stack(event)]
    result: List[AbstractContext] = []
    for context in contexts:
        if isinstance(context, context_type):
            result.append(context)
    return result


def get_global_contexts(event: AbstractEvent) -> List[AbstractGlobalContext]:
    """ Given an event, return all global contexts (if any)."""
    return event.global_contexts


def get_location_stack(event: AbstractEvent) -> List[AbstractLocationContext]:
    """ Given an event, return the location stack (location contexts)."""
    return event.location_stack


def add_global_context_to_event(event: AbstractEvent, context: AbstractContext) -> AbstractEvent:
    """ Add the global context to the event. Returns the modified event """
    if not isinstance(context, AbstractGlobalContext):
        raise ValueError(f'Trying to add invalid context to global contexts: {context}')
    event['global_contexts'].append(context)
    return event


def event_add_construct_context(event: AbstractEvent,
                                context_type: ContextType,
                                context_id: str,
                                **kwargs) -> AbstractEvent:
    """
    Create a new Context, and add that to the Event.
    :return: The modified Event.
    """

    context = make_context(_context_type=context_type, id=context_id, **kwargs)
    return add_global_context_to_event(event, context)
