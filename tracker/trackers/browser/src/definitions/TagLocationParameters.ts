import { func, object, optional } from 'superstruct';
import { AnyLocationContext } from './LocationContext';
import { TagLocationOptions } from './TagLocationOptions';
import { TrackerErrorHandlerCallback } from './TrackerErrorHandlerCallback';

/**
 * Used to decorate a Taggable Element with our Tagging Attributes.
 *
 * Returns an object containing the Tagging Attributes. It's properties are supposed to be spread on the target HTML
 * Element. This allows us to identify elements uniquely in a Document and to reconstruct their Location.
 *
 * For a higher level api see the tagLocationHelpers module.
 *
 * Examples
 *
 *    tagLocation({ instance: makeElementContext({ id: 'section-id' }) })
 *    tagLocation({ instance: makeElementContext({ id: 'section-id' }), { trackClicks: true } })
 *
 */
export const TagLocationParameters = object({
  instance: AnyLocationContext,
  options: optional(TagLocationOptions),
  onError: optional(func()),
});
export type TagLocationParameters = {
  instance: AnyLocationContext;
  options?: TagLocationOptions;
  onError?: TrackerErrorHandlerCallback;
};
