from typing import List
import re

from objectiv_backend.common.config import get_config_event_schema

# get schema
event_schema = get_config_event_schema()


def get_type(property_description: List[str]) -> str:
    type_name = property_description['type']

    if 'items' in property_description:
        abstract_type = property_description['items']

    if type_name == 'array':
        return f'List[{abstract_type}]'
    if type_name == 'object':
        return 'Dict{}'
    if type_name == 'string':
        return 'str'
    if type_name == 'integer':
        return 'int'

# first: events


def get_classes(objects: List) -> None:
    for obj_name, obj in objects:

        properties = []
        parent = ''
        parents = obj['parents']
        if re.match('^Abstract', obj_name):
            parents.append('ABC')
        if 'parents' in obj and len(parents) > 0:
            parent = f' ({", ".join(parents)})'
        if 'properties' in obj:

            for property_name, property_description in obj['properties'].items():
                p = '# ' + '\n    # '.join([s.strip() for s in property_description['description'].split('\n')]) + '\n'
                p += f'    {property_name}: {get_type(property_description)}'
                properties.append(p)
        if len(properties) == 0:
            properties = ['pass']

        property_string = '\n    '.join(properties)

        description = '\n#  '.join([s.strip() for s in obj['description'].split('\n')])
        tpl = (
            f'# {description}\n'
            f'class {obj_name}{parent}:\n'
            f'    {property_string}\n'
            f'\n'
        )

        print(tpl)


print('from typing import List, Dict')
print('from abc import ABC\n\n')
# print(event_schema.contexts.schema.items())
get_classes(event_schema.contexts.schema.items())

get_classes(event_schema.events.schema.items())

