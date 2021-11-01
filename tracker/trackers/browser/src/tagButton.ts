import { makeButtonContext } from '@objectiv/tracker-core';
import { assign, create, object, string } from 'superstruct';
import { LocationTaggerParameters } from './definitions/LocationTaggerParameters';
import { TagLocationReturnValue } from './definitions/TagLocationReturnValue';
import { trackerErrorHandler } from './helpers/trackerErrorHandler';
import { tagLocation } from './tagLocation';

/**
 * tagButton has an extra attribute, `text`, as mandatory parameter.
 */
export const TagButtonParameters = assign(LocationTaggerParameters, object({ text: string() }));
export type TagButtonParameters = LocationTaggerParameters & { text: string };

/**
 * tagButton is a shorthand for tagLocation. It eases the tagging of ButtonContext bound Elements
 */
export const tagButton = (parameters: TagButtonParameters): TagLocationReturnValue => {
  try {
    const { id, text, options } = create(parameters, TagButtonParameters);
    return tagLocation({ instance: makeButtonContext({ id, text }), options, onError: parameters.onError });
  } catch (error) {
    return trackerErrorHandler(error, parameters);
  }
};
