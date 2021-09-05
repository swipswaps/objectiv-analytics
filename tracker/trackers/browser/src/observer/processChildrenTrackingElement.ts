import { isEmptyObject } from '../isEmptyObject';
import { TrackChildrenParameters } from '../tracker/trackChildren';
import { TrackingAttribute } from '../TrackingAttributes';
import { isChildrenTrackingElement, TrackedElement } from '../typeGuards';

/**
 * Check if Element is a Children Tracking Element. If so:
 * - Run its children tracking queries
 * - Decorate matching Elements intoTracked Elements
 * - Return a list of the decorated Elements
 */
const processChildrenTrackingElement = (element: Element): TrackedElement[] => {
  const newlyTrackedElements: TrackedElement[] = [];

  if (!isChildrenTrackingElement(element)) {
    return newlyTrackedElements;
  }

  // TODO we need a proper parsers for these attributes with good validation
  const childrenTrackingQueriesAttribute = element.getAttribute(TrackingAttribute.trackChildren);
  /* istanbul ignore if - this cannot happen but we don't have proper type guards to enforce it */
  if (!childrenTrackingQueriesAttribute) {
    return newlyTrackedElements;
  }

  const childrenTrackingQueries = JSON.parse(childrenTrackingQueriesAttribute);
  if (!Array.isArray(childrenTrackingQueries)) {
    return newlyTrackedElements;
  }

  // TODO add validation for empty arrays (most probably to the attribute parser when we have it)

  childrenTrackingQueries.forEach(({ query, queryAll, trackAs }: TrackChildrenParameters) => {
    const queriedElements = [];

    if (isEmptyObject(trackAs)) {
      console.error(`trackAs attributes for query: ${query} are empty`);
      return;
    }

    if (query) {
      queriedElements.push(element.querySelector(query));
    }

    if (queryAll) {
      queriedElements.push(...Array.from(element.querySelectorAll(queryAll)));
    }

    queriedElements.forEach((queriedElement) => {
      if (!queriedElement) {
        console.error(`Could not find Element via querySelector query: ${query}`);
        return;
      }

      for (let [key, value] of Object.entries<string>(trackAs)) {
        queriedElement.setAttribute(key, value);
      }

      newlyTrackedElements.push(queriedElement as TrackedElement);
    });
  });

  return newlyTrackedElements;
};

export default processChildrenTrackingElement;
