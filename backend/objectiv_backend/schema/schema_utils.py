

class SchemaEntity(dict):
    """
    Base class, extends dict, so we can use objects as dictionaries, but this also
    enables json support ootb (Without custom serialisation methods.


    Here we add the '_context_type' or 'event' properties, so we can json serialize, without losing
    info on what kind of object it was
    """
    def __init__(self, **kwargs):
        dict.__init__(self, **kwargs)
        if hasattr(self, '_context_type'):
            # this is a context
            self['_context_type'] = self._context_type
        elif hasattr(self, 'event'):
            self['event'] = self.event
        else:
            # this should never happen! But better safe than sorry
            raise Exception(f'Unknown entity / missing attributes in {type(self)}')
