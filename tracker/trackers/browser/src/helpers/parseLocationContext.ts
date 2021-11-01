import { AnyLocationContext } from '../definitions/LocationContext';
import { parseJson } from './parseJson';

/**
 * Struct Parser for Location Contexts
 */
export const parseLocationContext = (stringifiedContext: string | null) => {
  return parseJson(stringifiedContext, AnyLocationContext);
};
