import { makeExpandableSectionContext } from '@objectiv/tracker-core';
import { create } from 'superstruct';
import { LocationTaggerParameters } from './definitions/LocationTaggerParameters';
import { trackerErrorHandler } from './helpers/trackerErrorHandler';
import { tagLocation, TagLocationReturnValue } from './tagLocation';

/**
 * tagExpandableElement is a shorthand for tagLocation. It eases the tagging of ExpandableSectionContext bound Elements
 */
export const tagExpandableElement = (parameters: LocationTaggerParameters): TagLocationReturnValue => {
  try {
    const { id, options } = create(parameters, LocationTaggerParameters);
    return tagLocation({ instance: makeExpandableSectionContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackerErrorHandler(error, parameters);
  }
};
