/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { ValidateAttribute } from '../../definitions/ValidateAttribute';
import { parseJson } from './parseJson';

/**
 * `validate` Tagging Attribute parser
 */
export const parseValidate = (stringifiedValidateAttribute: string | null) => {
  return parseJson(stringifiedValidateAttribute ?? '{}', ValidateAttribute);
};
