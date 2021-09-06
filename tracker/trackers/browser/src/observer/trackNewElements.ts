import { BrowserTracker } from '../tracker/BrowserTracker';
import { TrackingAttribute } from '../TrackingAttributes';
import processChildrenTrackingElement from './processChildrenTrackingElement';
import trackNewElement from './trackNewElement';

/**
 * Given a Mutation Observer node containing newly added nodes it will track visibility and attach events to them:
 */
function trackNewElements(element: Element, tracker: BrowserTracker = window.objectiv.tracker) {
  const trackedElements = element.querySelectorAll(`[${TrackingAttribute.context}]`);
  [element, ...Array.from(trackedElements)].forEach((element) => {
    // Process `track` attributes
    trackNewElement(element, tracker)

    // Process `trackChildren` attributes
    processChildrenTrackingElement(element).forEach((queriedElement) => {
      trackNewElement(queriedElement, tracker);
    });
  });
}

export default trackNewElements;
