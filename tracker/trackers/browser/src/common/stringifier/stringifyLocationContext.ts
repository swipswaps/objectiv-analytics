import { AnyLocationContext } from '../../definitions/LocationContext';
import { stringifyJson } from './stringifyJson';

/**
 * LocationContexts stringifier
 */
export const stringifyLocationContext = (contextObject: AnyLocationContext) => {
  return stringifyJson(contextObject, AnyLocationContext);
};
