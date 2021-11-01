import { AnyLocationContext } from '../definitions/LocationContext';
import { stringifyJson } from './stringifyJson';

/**
 * Struct Stringifier for Location Contexts
 */
export const stringifyLocationContext = (contextObject: AnyLocationContext) => {
  return stringifyJson(contextObject, AnyLocationContext);
};
