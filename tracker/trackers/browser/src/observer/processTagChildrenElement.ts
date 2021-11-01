import { getObjectKeys } from '@objectiv/tracker-core';
import { create } from 'superstruct';
import { ChildrenTaggingQuery } from '../definitions/ChildrenTaggingQuery';
import { isTagChildrenElement } from '../definitions/isTagChildrenElement';
import { TaggedElement } from '../definitions/TaggedElement';
import { TaggingAttribute } from '../definitions/TaggingAttribute';
import { StringifiedTaggingAttributes } from '../definitions/TaggingAttributes';
import { parseChildrenTaggingAttribute } from '../helpers/parseChildrenTaggingAttribute';
import { trackerErrorHandler } from '../helpers/trackerErrorHandler';

/**
 * Check if Element is a ChildrenTaggingElement. If so:
 * - Run its children tracking queries
 * - Decorate matching Elements into TaggedElements
 * - Return a list of the decorated Elements
 */
export const processTagChildrenElement = (element: Element): TaggedElement[] => {
  const newlyTrackedElements: TaggedElement[] = [];

  try {
    if (!isTagChildrenElement(element)) {
      return newlyTrackedElements;
    }
    const queries = parseChildrenTaggingAttribute(element.getAttribute(TaggingAttribute.tagChildren));

    queries.forEach((query: ChildrenTaggingQuery) => {
      const { queryAll, tagAs }: ChildrenTaggingQuery = create(query, ChildrenTaggingQuery);
      const trackingAsAttributes = create(tagAs, StringifiedTaggingAttributes);

      // Strip out undefined attributes
      getObjectKeys(trackingAsAttributes).forEach((key) => {
        if (trackingAsAttributes[key] === undefined) {
          delete trackingAsAttributes[key];
        }
      });

      element.querySelectorAll(queryAll).forEach((queriedElement) => {
        for (let [key, value] of Object.entries<string>(trackingAsAttributes)) {
          queriedElement.setAttribute(key, value);
        }

        newlyTrackedElements.push(queriedElement as TaggedElement);
      });
    });
  } catch (error) {
    trackerErrorHandler(error);
  }

  return newlyTrackedElements;
};
