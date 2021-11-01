import { makeLinkContext, } from '@objectiv/tracker-core';
import { assign, create, object, string } from 'superstruct';
import { LocationTaggerParameters } from "./definitions/LocationTaggerParameters";
import { trackerErrorHandler } from './helpers/trackerErrorHandler';
import { tagLocation, TagLocationReturnValue } from './tagLocation';

/**
 * tagLink is a shorthand for tagLocation. It eases the tagging of LinkContext bound Elements
 */
export const TagLinkParameters = assign(LocationTaggerParameters, object({ text: string(), href: string() }));
export type TagLinkParameters = LocationTaggerParameters & { text: string; href: string };
export const tagLink = (parameters: TagLinkParameters): TagLocationReturnValue => {
  try {
    const { id, text, href, options } = create(parameters, TagLinkParameters);
    return tagLocation({ instance: makeLinkContext({ id, text, href }), options, onError: parameters.onError });
  } catch (error) {
    return trackerErrorHandler(error, parameters);
  }
};
