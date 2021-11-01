import { makeLinkContext } from '@objectiv/tracker-core';
import { create } from 'superstruct';
import { TagLinkParameters } from './definitions/TagLinkParameters';
import { TagLocationReturnValue } from './definitions/TagLocationReturnValue';
import { trackerErrorHandler } from './helpers/trackerErrorHandler';
import { tagLocation } from './tagLocation';

/**
 * tagLink is a shorthand for tagLocation. It eases the tagging of LinkContext bound Elements
 */
export const tagLink = (parameters: TagLinkParameters): TagLocationReturnValue => {
  try {
    const { id, text, href, options } = create(parameters, TagLinkParameters);
    return tagLocation({ instance: makeLinkContext({ id, text, href }), options, onError: parameters.onError });
  } catch (error) {
    return trackerErrorHandler(error, parameters);
  }
};
