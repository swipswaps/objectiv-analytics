"""
Copyright 2021 Objectiv B.V.
"""


class Json:
    def __init__(self, series_object):
        self.series_object = series_object

    def __getitem__(self, key: int):
        expression = f'{self.series_object.expression}->{key}'
        return self.series_object._get_derived_series('string', expression)

    def get_index_as_string(self, index_number: int):
        expression = f'{self.series_object.expression}->>{index_number}'
        return self.series_object._get_derived_series('string', expression)

    def get_value(self, key: str, as_str=False):
        '''
        as_str: if True, it returns a string, else json
        '''
        return_type = ''
        if as_str:
            return_type = '>'
        expression = f"{self.series_object.expression}->{return_type}'{key}'"
        return self.series_object._get_derived_series('string', expression)
