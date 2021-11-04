/*
 * Copyright 2021 Objectiv B.V.
 */

import { assert, validate } from 'superstruct';
import { stringifyChildrenTaggingAttribute } from '../common/stringifiers/stringifyChildrenTaggingAttribute';
import { trackerErrorHandler } from '../common/trackerErrorHandler';
import { ChildrenTaggingQueries } from '../definitions/ChildrenTaggingQueries';
import { StringifiedChildrenTaggingAttributes } from '../definitions/StringifiedChildrenTaggingAttributes';
import { TagChildrenReturnValue } from '../definitions/TagChildrenReturnValue';
import { TaggingAttribute } from '../definitions/TaggingAttribute';
import { TrackerErrorHandlerCallback } from '../definitions/TrackerErrorHandlerCallback';

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
export const tagChildren = (
  parameters: ChildrenTaggingQueries,
  onError?: TrackerErrorHandlerCallback
): TagChildrenReturnValue => {
  try {
    // Validate input
    assert(parameters, ChildrenTaggingQueries);

    // Create output attributes object
    const LocationTaggingAttributes = {
      [TaggingAttribute.tagChildren]: stringifyChildrenTaggingAttribute(parameters),
    };

    // Validate
    validate(LocationTaggingAttributes, StringifiedChildrenTaggingAttributes);

    // Return
    return LocationTaggingAttributes;
  } catch (error) {
    return trackerErrorHandler(error, parameters, onError);
  }
};
