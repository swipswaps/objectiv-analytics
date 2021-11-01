import { makeButtonContext } from '@objectiv/tracker-core';
import { create } from 'superstruct';
import { TagButtonParameters } from './definitions/TagButtonParameters';
import { TagLocationReturnValue } from './definitions/TagLocationReturnValue';
import { trackerErrorHandler } from './helpers/trackerErrorHandler';
import { tagLocation } from './tagLocation';

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
