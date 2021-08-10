from typing import List, Dict, Any
import re

from objectiv_backend.common.config import get_config_event_schema


def get_type(property_description: Dict[str, str]) -> str:
    """
    Translate (json)schema property type to something Python understands
    :param property_description: from schema
    :return: string containing Python type
    """
    type_name = property_description['type']

    abstract_type = ''
    if 'items' in property_description:
        abstract_type = property_description['items']
    if type_name == 'array':
        return f'List[{abstract_type}]'
    if type_name == 'object':
        return 'Dict{str, Any}'
    if type_name == 'string':
        return 'str'
    if type_name == 'integer':
        return 'int'
    return 'str'


def get_parent_list(objects: Dict[str, dict]) -> Dict[str, list]:
    """
    Create list containing ancestry of all objects
    :param objects:
    :return: dictionary with a list of ancestors per object
    """
    # first create a list of parent per obj
    parent_mapping: Dict[str, Any] = {}
    for obj_name, obj in objects.items():
        if len(obj['parents']) > 0:
            parent_mapping[obj_name] = obj['parents'][0]
        else:
            parent_mapping[obj_name] = None

    parent_list: Dict[str, list] = {}
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


def get_all_properties(object_list: List, objects: Dict[str, dict]) -> Dict[str, dict]:
    """
    returns a dictionary containing properties of all objects in the list. Can be used to resolve all (inherited)
    properties of an object
    :param object_list: List of all objects in the ancestry
    :param objects:
    :return: dictionary of properties
    """
    properties: Dict[str, dict] = {}
    for obj in object_list:
        if 'properties' in objects[obj]:
            properties.update(objects[obj]['properties'])
    return properties


def get_event_factory(objects: Dict[str, dict]) -> List[str]:
    """
    Generate very basic factory to be able to load events
    :param objects:
    :return: str - function to instantiate classes
    """
    factory: List[str] = ['def make_event(event: str, **kwargs) -> AbstractEvent:']
    for obj_name, obj in objects.items():
        factory.append(f'    if event == "{obj_name}":\n'
                       f'        return {obj_name}(**kwargs)')
    factory.append(f'    return AbstractEvent(**kwargs)')
    return factory


def get_classes(objects: Dict[str, dict]) -> List[str]:
    """
    Generates python classes based on the list (Dict) of objects provided
    :param objects: Dict
    """

    pl = get_parent_list(objects)

    classes: List[str] = []
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
            parent = f'({", ".join(parents)})'

        # get object/class description from schema, and clean up some white space
        class_descriptions = [s.strip()
                              for s in obj['description'].split('\n')]

        # instance variables, for this instance (eg. self.variable)
        iv: List[str] = []

        # properties of _this_ instance
        properties: Dict[str, dict] = {}
        if 'properties' in obj and len(obj['properties']) > 0:
            properties = obj['properties']

        for property_name in properties.keys():
            if property_name not in ['_context_type', 'event']:
                iv.append(f'self.{property_name} = {property_name}')

        # constructor description arguments
        cda: List[str] = []
        # constructor args, these should include all instance variables, both for this instance,
        # but also for the super class
        args: List[str] = []
        # args to pass to super
        super_args: List[str] = []

        if len(all_properties) > 0:
            class_descriptions.append('\n    Attributes:')
            for property_name, property_description in all_properties.items():
                if property_name in ['_context_type', 'event']:
                    # ignore these properties, as they are reflected in the class name
                    continue
                if property_name not in properties:
                    super_args.append(f'{property_name}={property_name}')
                property_type = get_type(property_description)

                args.append(f'{property_name}: {property_type}')
                cda.append(
                    f':param {property_name}: \n           {property_description["description"].strip()}')

                class_descriptions.append(
                    f'    {property_name} ({property_type}):\n            {property_description["description"].strip()}'
                )

        # class description
        class_description = '\n    '.join(class_descriptions)

        set_instance_variables = ''
        if len(iv) > 0:
            set_instance_variables = '        ' + '\n        '.join(iv) + '\n'

        # constructor arguments
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

        # arguments to call super with
        super_args_string = ''
        if len(super_args) > 0:
            if len(super_args) > 3:
                super_args_string = ',\n                       ' + \
                    ', \n                       '.join(super_args)
            else:
                super_args_string = ', ' + ', '.join(super_args)

        # only call the super class if there is one (from within our own hierarchy)
        call_super_class = ''
        if super_class:
            call_super_class = f'        {super_class}.__init__(self{super_args_string})\n'

        constructor = (
            f'def __init__(self{args_string}):\n'
            f'{constructor_description}\n'
            f'{call_super_class}'
            f'{set_instance_variables}'
        )

        classes.append(
            f'class {obj_name}{parent}:\n'
            '    """\n'
            f'    {class_description}\n'
            '    """\n'
            f'    {constructor}\n'
        )

    classes.append('\n')
    return classes


def main():
    # get schema
    event_schema = get_config_event_schema()

    with open('schema.py', 'w') as output:
        # some imports
        imports = [
            'from typing import List',
            'from abc import ABC'
        ]
        output.write('\n'.join(imports) + '\n\n\n')
        # process contexts (needed for events, so we do these first)
        output.write('\n'.join(get_classes(event_schema.contexts.schema)))
        # process events
        output.write('\n'.join(get_classes(event_schema.events.schema)))

        output.write('\n'.join(get_event_factory(event_schema.events.schema)))


if __name__ == '__main__':
    main()
