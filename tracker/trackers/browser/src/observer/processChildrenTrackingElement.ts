import { create } from 'superstruct';
import { parseChildrenAttribute } from '../';
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
    const queries = parseChildrenAttribute(element.getAttribute(TrackingAttribute.trackChildren));

    queries.forEach((query: TrackChildrenQuery) => {
      const { queryAll, trackAs }: TrackChildrenQuery = create(query, TrackChildrenQuery);

      element.querySelectorAll(queryAll).forEach((queriedElement) => {
        for (let [key, value] of Object.entries<string>(trackAs as {})) {
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
