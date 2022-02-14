from enum import Enum


class NotSet(Enum):
    """
    INTERNAL: Special token used as default value for parameters, to distinguish the default value from
    None for Optional values.
    """
    token = 0


not_set: NotSet = NotSet.token
