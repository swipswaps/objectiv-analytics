from typing import List, Dict, Any
import re
import json

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
        return 'Dict[str, Any]'
    if type_name == 'string':
        return 'str'
    if type_name == 'integer':
        return 'int'
    return 'str'


def get_parents(class_name: str, parent_mapping: Dict[str, List[str]]) -> List[str]:
    """
    Recursively resolve all parents (ancestry) of class_name
    :param class_name: class to resolve
    :param parent_mapping: mapping of class_name -> parents
    :return: List[str], list of parent classes
    """
    parents: List[str] = parent_mapping[class_name]

    for parent in parent_mapping[class_name]:
        parents = [*parents, *get_parents(parent, parent_mapping)]

    return parents


def get_parent_list(objects: Dict[str, Dict[str, Any]]) -> Dict[str, List[str]]:
    """
    Create list containing full ancestry of all classes
    :param objects:
    :return: dictionary with a list of ancestors per object
    """
    # first create a list of parent per obj
    parent_mapping: Dict[str, List[str]] = {}
    for obj_name, obj in objects.items():
        parent_mapping[obj_name] = obj['parents']

    parent_list: Dict[str, List[str]] = {}
    for klass in parent_mapping.keys():
        parent_list[klass] = get_parents(class_name=klass, parent_mapping=parent_mapping)

    return parent_list


def get_all_properties(object_list: List[str], objects: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """
    returns a dictionary containing properties of all objects in the list. Can be used to resolve all (inherited)
    properties of an object
    :param object_list: List of all objects in the ancestry
    :param objects:
    :return: dictionary of properties
    """
    properties: Dict[str, Dict[str, Any]] = {}
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


def get_constructor_description(constructor_description_arguments: List[str]) -> str:
    """
    Build docstring for class constructor
    :param constructor_description_arguments:
    :return: str - python comment
    """
    return (
            f'        """\n'
            f'        ' + '\n        '.join(constructor_description_arguments) +
            f'\n        """\n'
    )


def get_super_arg_string(super_args: List[str]) -> str:
    """
    generates python code (string) of arguments to call super class with
    :param super_args:
    :return: str - formatted python code
    """
    super_args_string = ''
    if len(super_args) > 0:
        if len(super_args) > 3:
            super_args_string = ',\n                       ' + \
                                ', \n                       '.join(super_args)
        else:
            super_args_string = ', ' + ', '.join(super_args)
    return super_args_string


def get_args_string(args: List[str]) -> str:
    """
    Generate code fragment for constructor arguments
    :param args: list of arguments to pass to method
    :return: formatted string of joined arguments,  or empty string if none
    """
    args.append('**kwargs')
    if len(args) > 3:
        args_string = ',\n                 ' + \
                      ', \n                 '.join(args)
    else:
        args_string = ', ' + ', '.join(args)
    return args_string


def get_call_super_classes_string(super_classes: List[str], super_args: List[str]) -> str:
    """
    Generate code to call all supers
    :param super_classes: list of super classes
    :param super_args: arguments to call super class with
    :return: formatted string of python code
    """
    call_super_classes_string = ''
    for super_class in super_classes:
        # arguments to call super with
        super_args_string = get_super_arg_string(super_args)
        call_super_classes_string += f'        {super_class}.__init__(self{super_args_string})\n'
    return call_super_classes_string


def get_class(obj_name: str, obj: Dict[str, Any], all_properties: Dict[str, Any]) -> str:
    """
    Generated documented python code for a class representing the object indicated by obj_name
    :param obj_name: Name of class
    :param obj: list with definition of class, properties, etc
    :param all_properties: List of all properties (through class hierarchy)
    :return:
    """
    parents = obj['parents']

    super_classes: List[str] = []
    if len(obj['parents']) > 0:
        super_classes = [p for p in obj['parents']]
    if re.match('^Abstract', obj_name):
        parents.append('ABC')

    # get object/class description from schema, and clean up some white space
    class_descriptions = [s.strip() for s in obj['description'].split('\n')]

    # instance variables, for this instance (eg. self.variable)
    instance_variables: List[str] = []

    # properties of _this_ instance
    properties: Dict[str, dict] = {}
    if 'properties' in obj and len(obj['properties']) > 0:
        properties = obj['properties']

        for property_name in properties.keys():
            if property_name not in ['_context_type', 'event']:
                instance_variables.append(f'self.{property_name} = {property_name}')

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
                # if this is not a property of the current class, it must ne inherited from one of
                # its super classes
                super_args.append(f'{property_name}={property_name}')
            property_type = get_type(property_description)

            args.append(f'{property_name}: {property_type}')
            cda.append(
                f':param {property_name}: \n           {property_description["description"].strip()}')

            class_descriptions.append(
                f'    {property_name} ({property_type}):\n            {property_description["description"].strip()}'
            )

    # constructor arguments
    args_string = get_args_string(args)
    constructor_description = get_constructor_description(cda)
    call_super_classes = get_call_super_classes_string(super_classes, super_args)
    set_instance_variables = ''
    if len(instance_variables) > 0:
        set_instance_variables = '        ' + '\n        '.join(instance_variables) + '\n'

    constructor = (
        f'def __init__(self{args_string}):\n'
        f'{constructor_description}\n'
        f'{call_super_classes}'
        f'{set_instance_variables}'
    )

    parent_string = ''
    if len(parents) > 0:
        parent_string = f'({", ".join(parents)})'
    class_description = '\n    '.join(class_descriptions)

    return(
        f'class {obj_name}{parent_string}:\n'
        '    """\n'
        f'    {class_description}\n'
        '    """\n'
        f'    {constructor}\n'
    )


def get_classes(objects: Dict[str, dict]) -> List[str]:
    """
    Generates python source code for classes based on the list (Dict) of objects provided
    :param objects: Dict
    """

    parent_list = get_parent_list(objects)

    classes: List[str] = []
    for obj_name, obj in objects.items():
        hierarchy = [obj_name, *parent_list[obj_name]]
        all_properties = get_all_properties(hierarchy, objects=objects)
        classes.append(get_class(obj_name=obj_name, obj=obj, all_properties=all_properties))
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
