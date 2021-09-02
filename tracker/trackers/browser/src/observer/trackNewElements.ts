import { BrowserTracker } from '../tracker/BrowserTracker';
import { ElementTrackingAttribute } from '../TrackingAttributes';
import processChildrenTrackingElement from './processChildrenTrackingElement';
import trackNewElement from './trackNewElement';

/**
 * Given a Mutation Observer node containing newly added nodes it will track visibility and attach events to them:
 */
function trackNewElements(element: Element, tracker: BrowserTracker = window.objectiv.tracker) {
  const elements = element.querySelectorAll(`[${ElementTrackingAttribute.elementId}]`);
  [element, ...Array.from(elements)].forEach((element) => {
    // Process `track` attributes
    trackNewElement(element, tracker);

    // Process `trackChildren` attributes
    const childrenTrackedElements = processChildrenTrackingElement(element);
    childrenTrackedElements.forEach((queriedElement) => {
      trackNewElement(queriedElement, tracker);
    });
  });
}

export default trackNewElements;
