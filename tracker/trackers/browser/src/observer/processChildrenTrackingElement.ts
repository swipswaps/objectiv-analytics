import { TrackChildrenParameters } from '../tracker/trackChildren';
import { ChildrenTrackingAttribute } from '../TrackingAttributes';
import { isChildrenTrackingElement, isTrackableElement, TrackedElement } from '../typeGuards';

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

  const childrenTrackingQueriesAttribute = element.getAttribute(ChildrenTrackingAttribute.trackChildren);
  if (!childrenTrackingQueriesAttribute) {
    return newlyTrackedElements;
  }

  const childrenTrackingQueries = JSON.parse(childrenTrackingQueriesAttribute);
  if (!Array.isArray(childrenTrackingQueries)) {
    return newlyTrackedElements;
  }

  childrenTrackingQueries.forEach(({ query, queryAll, trackAs }: TrackChildrenParameters) => {
    const queriedElements = [];

    if (trackAs === {}) {
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
        console.error(`Could find Element via querySelector query: ${query}`);
        return;
      }

      if (!isTrackableElement(queriedElement)) {
        console.error(`Element matched with querySelector query: ${query} is not trackable`);
        return;
      }

      for (let [key, value] of Object.entries(trackAs)) {
        if (value !== undefined) {
          queriedElement.setAttribute(key, value);
        }
      }

      newlyTrackedElements.push(queriedElement as TrackedElement);
    });
  });

  return newlyTrackedElements;
};

export default processChildrenTrackingElement;
