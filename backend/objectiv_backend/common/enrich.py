"""
Copyright 2021 Objectiv B.V.
"""
from abc import abstractmethod, ABC
from copy import deepcopy
from typing import Dict, Any, List

# needed for validation
from objectiv_backend.common.types import EventData, ContextData
from objectiv_backend.schema.event_schemas import EventSchema
from objectiv_backend.common.event_utils import get_contexts, get_optional_context, add_global_context_to_event
from objectiv_backend.schema.validate_events import _validate_context_item


class Plugin(ABC):
    """
    Abstract Base Class of all Plugins
    """

    # input schema? TODO
    selector_events = set()
    input_contexts = set()
    output_contexts = set()

    @abstractmethod
    def enrich(self, event: EventData) -> List[ContextData]:
        """
        Given an event, return a list of new contexts with which the event should be enriched.
        :param event:
        :return:
        """
        raise NotImplementedError()

    @abstractmethod
    def get_schema(self) -> Dict[str, Any]:
        raise NotImplementedError()


class GeoLocationPlugin(Plugin):
    """ Example plugin """
    selector_events = {'Event'}
    input_contexts = {'HttpContext'}
    add_contexts = {'GeoLocationContext'}

    def enrich(self, event: EventData) -> List[ContextData]:
        http_context = get_optional_context(event, "HttpContext")
        if not http_context:
            return []
        remote_addr = http_context["remote_addr"]
        geo_location_context = {
            "_context_type": "GeoLocationContext",
            "id": "geo_location",
            "country": None,
            "city": None,
        }
        if remote_addr != "127.0.0.1":
            # TODO: add actual magic here
            geo_location_context["country"] = "NL"
            geo_location_context["city"] = "Utrecht"
        return [geo_location_context]

    def get_schema(self) -> Dict[str, Any]:
        return {
                "GeoLocationContext": {
                    "parents": ["AbstractGlobalContext"],
                    "properties": {
                        "country": {
                            "anyOff": [
                                {"type": "string"},
                                {"type": "null"}
                            ]
                        },
                        "city": {
                            "anyOff": [
                                {"type": "string"},
                                {"type": "null"}
                            ]
                        }
                    }
                }
            }


PLUGINS = [GeoLocationPlugin()]


def apply_plugin_enrichment(event: EventData, plugin: Plugin) -> EventData:
    """
    Apply plugin, and append to event's contexts
    :param event:
    :param plugin:
    :return:
    """
    if not (plugin.selector_events & set(event["events"])):
        # plugin hasn't select the event type
        return event
    contexts = []
    for input_context in plugin.input_contexts:
        found_input_contexts = get_contexts(event=event, context_type=input_context)
        if not found_input_contexts:
            # one of the requires contexts for this filter is not found, do not apply plugin or ?
            # todo: or should we always apply the plugin, and already make sure in the configuration that
            # the inputs will always be there?
            # return event
            raise Exception(f'Context {input_context} not found in event.')
        contexts.extend(found_input_contexts)

    event_copy = {
        "event": event["event"],
        "events": deepcopy(event["events"]),
        "contexts": contexts
    }
    result = plugin.enrich(event_copy)
    schema = plugin.get_schema()

    event_schema = EventSchema({}, schema)

    for context in result:
        validation_result = _validate_context_item(event_schema, context)
        if len(validation_result) > 0:
            print(f'Error validation plugin {plugin} output: {validation_result}')
        else:
            event = add_global_context_to_event(event, result)

    return event


def enrich_event(event: EventData) -> EventData:
    plugins = PLUGINS
    for plugin in plugins:
        event = apply_plugin_enrichment(event, plugin)
    return event


def get_plugin_schemas() -> Dict[str, Any]:
    plugins = PLUGINS

    schemas = {}
    for plugin in plugins:
        schemas.update(plugin.get_schema())
    return schemas
