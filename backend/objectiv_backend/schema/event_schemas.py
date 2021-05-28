"""
Copyright 2021 Objectiv B.V.
"""
import json
import os
import re
import sys
from copy import deepcopy
from typing import Set, List, Dict, Any, Optional

EventType = str
ContextType = str


class EventSubSchema:
    """
    Immutable sub-schema containing events, their inheritance hierarchy and required contexts for events.
    """

    def __init__(self):
        """
        Create an empty EventSubSchema.
        Use extend_schema to add event types to the schema.
        """
        # TODO: efficiency, both this class and context_schema.py could calculate most function results at
        #       init-time which would be much more efficient.
        self.schema: Dict[str, Dict[str, list]] = {}

    def extend_schema(self, event_schema: Dict[str, Any]) -> 'EventSubSchema':
        """
        Extend the schema with the events in event_schema. Returns a new EventSubSchema, self is
        unmodified.

        :raises:
        """
        schema = deepcopy(self.schema)
        for event_type, data in event_schema.items():
            if not re.match('^[A-Z][a-zA-Z0-9]*Event$', event_type):
                raise ValueError(f'Invalid Event name: {event_type}')
            if event_type not in schema:
                schema[event_type] = {"parents": [], "requiresContext": []}
            schema[event_type]["parents"].extend(data["parents"])
            schema[event_type]["requiresContext"].extend(data["requiresContext"])
        event_schema = EventSubSchema()
        event_schema.schema = schema
        return event_schema

    def list_event_types(self) -> List[str]:
        """ Give a alphabetically sorted list of all event-types. """
        return sorted(self.schema.keys())

    def get_all_parent_event_types(self, event_type: str) -> Set[str]:
        """
        Given an event_type, give a set with that event_type and all its parent event_types.
        :param event_type: event type. Must be a valid event_type
        :return: set of event_types
        """
        if not self.is_valid_event_type(event_type):
            raise ValueError(f'Not a valid event_type {event_type}')
        result: Set[str] = {event_type}
        parents: List[str] = self.schema[event_type].get("parents", [])
        for parent in parents:
            result |= self.get_all_parent_event_types(parent)
        return result

    def get_all_required_contexts(self, event_type: str) -> Set[str]:
        """
        Get all contexts that are required by the given event. This includes context types that are
        required by the type's parent events.
        :param event_type: event type. Must be a valid event_type
        :return: set of context_types
        """
        if not self.is_valid_event_type(event_type):
            raise ValueError(f'Not a valid event_type {event_type}')
        klasses = self.get_all_parent_event_types(event_type)
        result = set()
        for klass in klasses:
            result |= set(self.schema[klass].get("requiresContext", []))
        return result

    def is_valid_event_type(self, event_type: str) -> bool:
        return event_type in self.schema


class ContextSubSchema:
    """ TODO: comments """
    def __init__(self):
        """ TODO: comments" """
        self.schema: Dict[str, Any] = {}

    def __str__(self) -> str:
        return json.dumps(self.schema, indent=4)

    def extend_schema(self, context_schema_extension) -> 'ContextSubSchema':
        """
        Create a new context schema that combines the current schema with the schema extension

        TODO: more, and better documentation
        TODO: build smarter data structures, such that functions below are simple lookups.
        """
        schema = deepcopy(self.schema)
        for context_type, data in context_schema_extension.items():

            if context_type not in schema:
                schema[context_type] = {"parents": [], "properties": {}}

            schema[context_type]["parents"].extend(data.get("parents", []))

            for property_type, property_data in data.get("properties", {}).items():
                if property_type not in schema[context_type]["properties"]:
                    schema[context_type]["properties"][property_type] = {}
                existing_property = schema[context_type]["properties"][property_type]
                for sub_property_name, sub_property_value in property_data.items():
                    if (sub_property_name in existing_property and
                            sub_property_value != existing_property[sub_property_name]):
                        raise ValueError(f'Cannot change a property of an existing property. '
                                         f'Redefining value of {sub_property_name} of {property_type}')
                    existing_property[sub_property_name] = sub_property_value
        context_schema = ContextSubSchema()
        context_schema.schema = schema
        return context_schema

    def list_context_types(self) -> List[str]:
        """ Give a alphabetically sorted list of all context-types. """
        return sorted(self.schema.keys())

    def get_all_parent_context_types(self, context_type: str) -> Set[str]:
        """
        Given a context_type, give a set with that context_type and all its parent context_types
        """
        result: Set[str] = {context_type}
        parents: List[str] = self.schema.get(context_type, {}).get("parents", [])
        for parent in parents:
            result |= self.get_all_parent_context_types(parent)
        return result

    def get_all_child_context_types(self, context_type: str) -> Set[str]:
        """
        Given a context_type, give a set with that context_type and all its child context_types
        """
        result: Set[str] = set()
        for ct in self.list_context_types():
            if context_type in self.get_all_parent_context_types(ct):
                result.add(ct)
        return result

    def get_context_schema(self, context_type: str) -> Optional[Dict[str, Any]]:
        """
        Give the json-schema for a specific context_type, or None if the context type doesn't exist.
        """
        if context_type not in self.schema:
            return None
        all_classes = self.get_all_parent_context_types(context_type)
        properties = {}
        for klass in all_classes:
            class_properties = deepcopy(self.schema[klass].get("properties", {}))
            for key, value in class_properties.items():
                properties[key] = deepcopy(value)
        schema = {
            "type": "object",
            "properties": properties,
            "required": sorted(properties.keys())
        }
        return schema


class EventSchema:
    """
    TODO: document
    """

    def __init__(self):
        """
        Create an empty EventSchema.
        Use extend_schema to add types to the schema.
        """
        self.version = {}
        self.events = EventSubSchema()
        self.contexts = ContextSubSchema({})

    def extend_schema(self, schema: Dict[str, Any]) -> 'EventSchema':
        """
        TODO: document
        Allowed extensions for events:
            * adding new events
            * adding parents to an existing event
            * adding contexts to the requiresContext field of an existing event
        Allowed extensions for contexts:
            * adding new contexts
            * adding parents to an existing context
            * adding properties to an existing context
            * adding sub-properties to an existing context (e.g. a "minimum" field for an integer)

        """
        events = deepcopy(self.events)
        contexts = deepcopy(self.contexts)
        version = deepcopy(self.version)

        events = events.extend_schema(schema['events'])
        contexts = contexts.extend_schema(schema['contexts'])
        version.update(schema['version'])
        # todo: separate version merging, and do some validation on this
        # extension_name = event_schema['name']
        # if extension_name in self.schema['version']:
        #     raise ValueError(f'Duplicate schema name. '
        #                      f'Already a version of "{extension_name}" loaded')

        # TODO: 'compile' schema

        result = EventSchema()
        result.events = events
        result.contexts = contexts
        result.version = version
        return result

    def __str__(self) -> str:
        """ Json representation of this data-schema. """
        schema_obj = {
            "version": self.version,
            "events": self.events.schema,
            "contexts": self.contexts.schema
        }
        return json.dumps(schema_obj, indent=4)

    def list_event_types(self) -> List[str]:
        """ Give a alphabetically sorted list of all event-types. """
        return self.events.list_event_types()

    def get_all_parent_event_types(self, event_type: str) -> Set[str]:
        """
        Given an event_type, give a set with that event_type and all its parent event_types.
        :param event_type: event type. Must be a valid event_type
        :return: set of event_types
        """
        return self.events.get_all_parent_event_types(event_type=event_type)

    def get_all_required_contexts(self, event_type: str) -> Set[str]:
        return self.events.get_all_required_contexts(event_type=event_type)

    def is_valid_event_type(self, event_type: str) -> bool:
        return self.events.is_valid_event_type(event_type=event_type)

    def list_context_types(self) -> List[str]:
        return self.contexts.list_context_types()

    def get_all_parent_context_types(self, context_type: str) -> Set[str]:
        return self.contexts.get_all_parent_context_types(context_type=context_type)

    def get_all_child_context_types(self, context_type: str) -> Set[str]:
        return self.contexts.get_all_child_context_types(context_type=context_type)

    def get_context_schema(self, context_type: str) -> Optional[Dict[str, Any]]:
        return self.contexts.get_context_schema(context_type=context_type)


def get_event_schema(schema_extensions_directory: Optional[str]) -> EventSchema:
    """
    Get the event schema.

    The schema is based on base_schema.json and the schema files in the optional
    schema_extension_directory.
    Files in the extension directory qualify for loading if their name matches [a-z0-9_]+\.json. The files
    are loaded in alphabetical order.

    :param schema_extensions_directory: optional directory path.
    """
    base_schema_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'base_schema.json')
    files_to_load = [base_schema_path]

    if schema_extensions_directory:
        all_filenames = sorted(os.listdir(schema_extensions_directory))
        for filename in all_filenames:
            if not re.match(r'[a-z0-9_]+\.json', filename):
                print(f'Ignoring non-schema file: {filename}', file=sys.stderr)
                continue
            files_to_load.append(os.path.join(schema_extensions_directory, filename))

    schema_jsons = []
    for filepath in files_to_load:
        with open(filepath, mode='r') as file:
            raw_data = file.read()
        try:
            schema = json.loads(raw_data)
        except ValueError as exc:
            raise Exception(f'Schema file does not contain valid json {filepath}') from exc
        # todo: schema validation
        schema_jsons.append(schema)

    event_schema = EventSchema()
    for schema_json in schema_jsons:
        event_schema = event_schema.extend_schema(schema_json)
    return event_schema
