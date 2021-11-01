import { makeNavigationContext } from '@objectiv/tracker-core';
import { create } from 'superstruct';
import { LocationTaggerParameters } from './definitions/LocationTaggerParameters';
import { trackerErrorHandler } from './helpers/trackerErrorHandler';
import { tagLocation, TagLocationReturnValue } from './tagLocation';

/**
 * tagNavigation is a shorthand for tagLocation. It eases the tagging of NavigationContext bound Elements
 */
export const tagNavigation = (parameters: LocationTaggerParameters): TagLocationReturnValue => {
  try {
    const { id, options } = create(parameters, LocationTaggerParameters);
    return tagLocation({ instance: makeNavigationContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackerErrorHandler(error, parameters);
  }
};
