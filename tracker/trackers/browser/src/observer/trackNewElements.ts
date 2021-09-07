import { BrowserTracker } from '../tracker/BrowserTracker';
import { TrackingAttribute } from '../TrackingAttributes';
import processChildrenTrackingElement from './processChildrenTrackingElement';
import trackNewElement from './trackNewElement';

/**
 * Given a Mutation Observer node containing newly added nodes it will track visibility and attach events to them:
 */
function trackNewElements(element: Element, tracker: BrowserTracker) {
  // Process `track` attributes
  const trackedElements = element.querySelectorAll(`[${TrackingAttribute.context}]`);
  [element, ...Array.from(trackedElements)].forEach((element) => trackNewElement(element, tracker));

  // Process `trackChildren` attributes
  const childrenTrackingElements = element.querySelectorAll(`[${TrackingAttribute.trackChildren}]`);
  [element, ...Array.from(childrenTrackingElements)].forEach((element) => {
    processChildrenTrackingElement(element).forEach((queriedElement) => {
      trackNewElement(queriedElement, tracker);
    });
  });
}

export default trackNewElements;
