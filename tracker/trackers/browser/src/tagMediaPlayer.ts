import { makeMediaPlayerContext } from '@objectiv/tracker-core';
import { create } from 'superstruct';
import { LocationTaggerParameters } from './definitions/LocationTaggerParameters';
import { trackerErrorHandler } from './helpers/trackerErrorHandler';
import { tagLocation, TagLocationReturnValue } from './tagLocation';

/**
 * tagMediaPlayer is a shorthand for tagLocation. It eases the tagging of MediaPlayerContext bound Elements
 */
export const tagMediaPlayer = (parameters: LocationTaggerParameters): TagLocationReturnValue => {
  try {
    const { id, options } = create(parameters, LocationTaggerParameters);
    return tagLocation({ instance: makeMediaPlayerContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackerErrorHandler(error, parameters);
  }
};
