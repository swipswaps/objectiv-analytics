import { makeInputContext } from '@objectiv/tracker-core';
import { create } from 'superstruct';
import { LocationTaggerParameters } from './definitions/LocationTaggerParameters';
import { trackerErrorHandler } from './helpers/trackerErrorHandler';
import { tagLocation, TagLocationReturnValue } from './tagLocation';

/**
 * tagInput is a shorthand for tagLocation. It eases the tagging of InputContext bound Elements
 */
export const tagInput = (parameters: LocationTaggerParameters): TagLocationReturnValue => {
  try {
    const { id, options } = create(parameters, LocationTaggerParameters);
    return tagLocation({ instance: makeInputContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackerErrorHandler(error, parameters);
  }
};
