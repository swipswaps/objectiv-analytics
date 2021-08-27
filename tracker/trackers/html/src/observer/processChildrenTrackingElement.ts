import {
  ChildrenTrackingAttribute,
  ChildTrackingQuery,
  StringifiedElementTrackingAttributes,
} from '../TrackingAttributes';
import { isChildrenTrackingElement, isTrackableElement, TrackedElement } from '../typeGuards';

/**
 * Check if Element is a Children Tracking Element. If so:
 * - Run its children tracking queries
 * - Decorate matching Elements intoTracked Elements
 * - Return a list of the decorated Elements
 */
const processChildrenTrackingElement = (element: Element): TrackedElement[] => {
  const queriedElements: TrackedElement[] = [];

  if (!isChildrenTrackingElement(element)) {
    return queriedElements;
  }

  const childrenTrackingQueriesAttribute = element.getAttribute(ChildrenTrackingAttribute.trackChildren);
  if (!childrenTrackingQueriesAttribute) {
    return queriedElements;
  }

  const childrenTrackingQueries = JSON.parse(childrenTrackingQueriesAttribute);
  if (!Array.isArray(childrenTrackingQueries)) {
    return queriedElements;
  }

  childrenTrackingQueries.forEach(({ query, trackAs }: ChildTrackingQuery) => {
    const queriedElement = element.querySelector(query);
    if (!queriedElement) {
      console.error(`Could find Element via querySelector query: ${query}`);
      return;
    }

    if (!isTrackableElement(queriedElement)) {
      console.error(`Element matched with querySelector query: ${query} is not trackable`);
      return;
    }

    let key: keyof StringifiedElementTrackingAttributes;
    for (key in trackAs) {
      const value = trackAs[key];
      if (value !== undefined) {
        queriedElement.setAttribute(key, value);
      }
    }

    queriedElements.push(queriedElement as TrackedElement);
  });

  return queriedElements;
};

export default processChildrenTrackingElement;
