import { assert, Infer, optional, validate } from 'superstruct';
import {
  StringifiedChildrenTaggingAttributes,
  stringifyChildrenTaggingAttribute,
} from './definitions/structChildrenTaggingAttribute';
import { ChildrenTaggingQueries, ChildrenTaggingQuery } from './definitions/structChildrenTaggingQuery';
import { TaggingAttribute } from './definitions/TaggingAttribute';
import { trackerErrorHandler, TrackOnErrorCallback } from './helpers/trackerErrorHandler';

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
export const TagChildrenReturnValue = optional(StringifiedChildrenTaggingAttributes);
export type TagChildrenReturnValue = Infer<typeof TagChildrenReturnValue>;

export const tagChildren = (parameters: ChildrenTaggingQueries, onError?: TrackOnErrorCallback) => {
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

/**
 * Syntactic sugar to track only one child.
 *
 * Examples
 *
 *    tagChild({
 *      query: '#button1',
 *      tagAs: tagButton({ id: 'button1', text: 'Button 1' })
 *    })
 *
 *    tagChild({
 *      query: '#button2',
 *      tagAs: tagButton({ id: 'button2', text: 'Button 2' })
 *    })
 *
 */
export const tagChild = (parameters: ChildrenTaggingQuery, onError?: TrackOnErrorCallback) => {
  return tagChildren([parameters], onError);
};
