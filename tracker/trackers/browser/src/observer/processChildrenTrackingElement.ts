import { isEmptyObject } from '../isEmptyObject';
import { trackerErrorHandler } from '../tracker/trackerErrorHandler';
import { TrackChildrenQuery, TrackingAttribute } from '../TrackingAttributes';
import { isChildrenTrackingElement, TrackedElement } from '../typeGuards';

/**
 * Check if Element is a Children Tracking Element. If so:
 * - Run its children tracking queries
 * - Decorate matching Elements intoTracked Elements
 * - Return a list of the decorated Elements
 */
const processChildrenTrackingElement = (element: Element): TrackedElement[] => {
  const newlyTrackedElements: TrackedElement[] = [];

  try {
    if (!isChildrenTrackingElement(element)) {
      return newlyTrackedElements;
    }

    // TODO we need a proper parsers for these attributes with good validation
    // TODO we need a proper parsers for these attributes with good validation
    // TODO we need a proper parsers for these attributes with good validation
    // TODO we need a proper parsers for these attributes with good validation
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

    childrenTrackingQueries.forEach(({ queryAll, trackAs }: TrackChildrenQuery) => {
      const queriedElements = [];

      // FIXME remove this and use superstruct guard instead
      if (!trackAs || isEmptyObject(trackAs)) {
        console.error(`trackAs attributes for query: ${queryAll} are empty`);
        return;
      }

      if (queryAll) {
        queriedElements.push(...Array.from(element.querySelectorAll(queryAll)));
      }

      queriedElements.forEach((queriedElement) => {
        if (!queriedElement) {
          console.error(`Could not find any Element via querySelector query: ${queryAll}`);
          return;
        }

        for (let [key, value] of Object.entries<string>(trackAs)) {
          queriedElement.setAttribute(key, value);
        }

        newlyTrackedElements.push(queriedElement as TrackedElement);
      });
    });
  } catch (error) {
    trackerErrorHandler(error);
  }

  return newlyTrackedElements;
};

export default processChildrenTrackingElement;
