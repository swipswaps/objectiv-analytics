from typing import List, Dict, Any
import re

from objectiv_backend.common.config import get_config_event_schema

# get schema
event_schema = get_config_event_schema()


def get_type(property_description: Dict[str, str]) -> str:
    type_name = property_description['type']

    abstract_type = ''
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
    return 'str'

# first: events


def get_parent_list(objects: Dict) -> Dict:
    # first create a list of parent per obj
    parent_mapping = {}
    for obj_name, obj in objects:
        if len(obj['parents']) > 0:
            parent_mapping[obj_name] = obj['parents'][0]
        else:
            parent_mapping[obj_name] = None

    parent_list = {}
    for klass in parent_mapping.keys():
        parent = parent_mapping[klass]
        parent_list[klass] = []

        while True:
            if parent in parent_mapping:
                parent_list[klass].append(parent)
                parent = parent_mapping[parent]
            else:
                break

    return parent_list


def get_all_properties(object_list: List, objects: Dict) -> Dict:
    properties = {}
    for obj in object_list:
        if 'properties' in objects[obj]:
            properties.update(objects[obj]['properties'])
    return properties


def get_classes(objects: Dict) -> None:

    pl = get_parent_list(objects.items())

    for obj_name, obj in objects.items():

        hierarchy = [obj_name, *pl[obj_name]]
        all_properties = get_all_properties(hierarchy, objects=objects)

        parent = ''
        parents = obj['parents']
        super_class = None
        if len(obj['parents']) > 0:
            super_class = obj['parents'][0]
        if re.match('^Abstract', obj_name):
            parents.append('ABC')
        if len(parents) > 0:
            parent = f' ({", ".join(parents)})'

        class_description = [s.strip() for s in obj['description'].split('\n')]

        # constructor args, these should include all instance variables, both for this instance,
        # but also for the super class
        args = []
        # instance variables, for this instance
        iv = []
        # args to pass to super
        super_args = []

        # properties of _this_ instance
        properties = {}
        if 'properties' in obj and len(obj['properties']) > 0:
            properties = obj['properties']

        for property_name in properties.keys():
            if property_name not in ['_context_type', 'event']:
                iv.append(f'self.{property_name} = {property_name}')

        cda = []
        if len(all_properties) > 0:
            class_description.append('\n    Attributes:')
            for property_name, property_description in all_properties.items():
                if property_name in ['_context_type', 'event']:
                    # ignore these properties, as they are reflected in the class name
                    continue
                if property_name not in properties:
                    super_args.append(f'{property_name}={property_name}')
                property_type = get_type(property_description)

                args.append(f'{property_name}: {property_type}')
                cda.append(f':param {property_name}: {property_type} -\n           {property_description["description"].strip()}')

                class_description.append(
                    f'    {property_name} ({property_type}):\n            {property_description["description"].strip()}')

        instance_variables = '\n        '.join(iv)
        if len(iv) > 0:
            instance_variables += '\n'

        args_string = ''
        if len(args) > 0:
            if len(args) > 3:
                args_string = ',\n                 ' + \
                    ', \n                 '.join(args)
            else:
                args_string = ', ' + ', '.join(args)

        constructor_description = (
            f'        """\n'
            f'        ' + '\n        '.join(cda) +
            f'\n        """\n'
        )

        super_args_string = ''
        if len(super_args) > 0:
            if len(super_args) > 3:
                super_args_string = ',\n                       ' + \
                    ', \n                       '.join(super_args)
            else:
                super_args_string = ', ' + ', '.join(super_args)

        call_super_class = ''
        if super_class:
            call_super_class = f'        {super_class}.__init__(self{super_args_string})\n'

        constructor = (
            f'def __init__(self{args_string}):\n'
            f'{constructor_description}\n'
            f'{call_super_class}'
            f'        {instance_variables}'
        )

        description = '\n    '.join(class_description)
        tpl = (

            f'class {obj_name}{parent}:\n'
            '    """\n'
            f'    {description}\n'
            '    """\n'
            f'    {constructor}\n'
        )

        print(tpl)


print('from typing import List')
print('from abc import ABC\n\n')
# print(event_schema.contexts.schema.items())
get_classes(event_schema.contexts.schema)

get_classes(event_schema.events.schema)
