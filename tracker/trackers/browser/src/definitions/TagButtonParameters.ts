import { LocationTaggerParameters } from '@objectiv/tracker-browser';
import { assign, object, string } from 'superstruct';

/**
 * tagButton has an extra attribute, `text`, as mandatory parameter.
 */
export const TagButtonParameters = assign(LocationTaggerParameters, object({ text: string() }));
export type TagButtonParameters = LocationTaggerParameters & { text: string };
