import { assert, validate } from 'superstruct';
import {
  StringifiedChildrenTaggingAttributes,
  stringifyChildrenTaggingAttribute,
} from './definitions/ChildrenTaggingAttribute';
import { ChildrenTaggingQueries } from './definitions/ChildrenTaggingQuery';
import { TagChildrenReturnValue } from "./definitions/TagChildrenReturnValue";
import { TaggingAttribute } from './definitions/TaggingAttribute';
import { TrackerErrorHandlerCallback } from "./definitions/TrackerErrorHandlerCallback";
import { trackerErrorHandler } from './helpers/trackerErrorHandler';

/**
 * Used to decorate a TaggableElement with our Children Tagging Attributes.
 *
 * Returns an object containing the Children Tagging Attribute only.
 * This attribute is a serialized list of ChildrenTaggingQuery objects and will be parsed and executed by our Observer
 * as soon as the elements gets rendered.
 *
 * Examples
 *
 *    tagChildren([
 *      {
 *        queryAll: 'button[aria-label="Previous"]',
 *        tagAs: tagButton({ id: 'prev', text: 'Previous' })
 *      },
 *      {
 *        queryAll: 'button[aria-label="Next"]',
 *        tagAs: tagButton({ id: 'next', text: 'Next' })
 *      }
 *    ])
 */
export const tagChildren = (parameters: ChildrenTaggingQueries, onError?: TrackerErrorHandlerCallback): TagChildrenReturnValue => {
  try {
    // Validate input
    assert(parameters, ChildrenTaggingQueries);

    // Create output attributes object
    const taggingAttributes = {
      [TaggingAttribute.tagChildren]: stringifyChildrenTaggingAttribute(parameters),
    };

    // Validate
    validate(taggingAttributes, StringifiedChildrenTaggingAttributes);

    // Return
    return taggingAttributes;
  } catch (error) {
    return trackerErrorHandler(error, parameters, onError);
  }
};
