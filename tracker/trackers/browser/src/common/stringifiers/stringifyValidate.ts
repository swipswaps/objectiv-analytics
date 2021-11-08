import { ValidateAttribute } from '../../definitions/ValidateAttribute';
import { stringifyJson } from './stringifyJson';

/**
 * `validate` Tagging Attribute stringifier
 */
export const stringifyValidate = (validateAttribute: ValidateAttribute) => {
  if (!(typeof validateAttribute === 'object')) {
    throw new Error(`validate Attribute must be an object, received: ${JSON.stringify(validateAttribute)}`);
  }
  return stringifyJson(validateAttribute, ValidateAttribute);
};
