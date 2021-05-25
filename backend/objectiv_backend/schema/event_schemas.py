"""
Copyright 2021 Objectiv B.V.
"""
import json
import os
import re
import sys
from copy import deepcopy
from typing import Set, List, Dict, Any, Optional

import json

from objectiv_backend.schema.context_schemas import ContextSchema


class EventSchema:
    def __init__(self, schemas: List[Dict[str, Any]]):
        """
        EventSchema, including the ContextSchema

        :param schemas: non-empty list of valid Schemas (extensions), in their dictionary notation.
            Might be modified in this function.

        TODO
        :param event_schema_extension: Allowed extensions:
            * adding new events
            * adding parents to an existing event
            * adding contexts to the requiresContext field of an existing event
        :param context_schema_extension: Allowed extensions:
            * adding new contexts
            * adding parents to an existing context
            * adding properties to an existing context
            * adding sub-properties to an existing context (e.g. a "minimum" field for an integer)
        """
        # TODO: efficiency, both this class and context_schema.py could calculate most function results at
        #       init-time which would be much more efficient.
        # TODO: ensure schema_extension is validated.

        self.schema = {}
        self.context_schema = ContextSchema({})
        for schema in schemas:
            event_schema = schema['events']
            context_schema = schema['contexts']
            # Extend context schema
            self.context_schema = self.context_schema.extend_schema(context_schema)
            # Extend event schema
            for event_type, data in event_schema.items():
                if event_type not in self.schema:
                    self.schema[event_type] = {"parents": [], "requiresContext": []}
                self.schema[event_type]["parents"].extend(data["parents"])
                self.schema[event_type]["requiresContext"].extend(data["requiresContext"])

    def __str__(self) -> str:
        """ Json representation of this event-schema. """
        schema_obj = {
            "events": self.schema,
            "contexts": self.context_schema.schema
        }
        return json.dumps(schema_obj, indent=4)

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

    def list_context_types(self) -> List[str]:
        return self.context_schema.list_context_types()

    def get_all_parent_context_types(self, context_type: str) -> Set[str]:
        return self.context_schema.get_all_parent_context_types(context_type=context_type)

    def get_all_child_context_types(self, context_type: str) -> Set[str]:
        return self.context_schema.get_all_child_context_types(context_type=context_type)

    def get_context_schema(self, context_type: str) -> Optional[Dict[str, Any]]:
        return self.context_schema.get_context_schema(context_type=context_type)


def get_event_schema(schema_extensions_directory: Optional[str]) -> EventSchema:
    """
    Get the event schema.

    The schema is based on base_schema.json and the schema files in the optional
    schema_extension_directory.
    Files in the extension directory qualify for loading if their name matches [a-z0-9_]+.json. The files
    are loaded in alphabetical order.

    :param schema_extensions_directory: optional directory path.
    """
    base_schema_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'base_schema.json')
    files_to_load = [base_schema_path]

    if schema_extensions_directory:
        all_filenames = sorted(os.listdir(schema_extensions_directory))
        for filename in all_filenames:
            if not re.match('[a-z0-9_]+.json', filename):
                print(f'Ignoring non-schema file: {filename}', file=sys.stderr)
                continue
            files_to_load.append(os.path.join(schema_extensions_directory, filename))

    schemas = []
    for filepath in files_to_load:
        with open(filepath, mode='r') as file:
            raw_data = file.read()
        try:
            schema = json.loads(raw_data)
        except ValueError as exc:
            raise Exception(f'Schema file does not contain valid json {filepath}') from exc
        # todo: schema validation
        schemas.append(schema)

    event_schema = EventSchema(schemas=schemas)
    return event_schema
