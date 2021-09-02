import { BrowserTracker } from '../tracker/BrowserTracker';
import { ElementTrackingAttribute } from '../TrackingAttributes';
import processChildrenTrackingElement from './processChildrenTrackingElement';
import trackNewElement from './trackNewElement';

/**
 * Given a Mutation Observer node containing newly added nodes it will track visibility and attach events to them:
 */
function trackNewElements(element: Element, tracker: BrowserTracker = window.objectiv.tracker) {
  // Process `track` attributes
  const trackedElements = element.querySelectorAll(`[${ElementTrackingAttribute.context}]`);
  [element, ...Array.from(trackedElements)].forEach((element) => trackNewElement(element, tracker));

  // Process `trackChildren` attributes
  const childrenTrackedElements = processChildrenTrackingElement(element);

  childrenTrackedElements.forEach((queriedElement) => {
    trackNewElement(queriedElement, tracker);
  });
}

export default trackNewElements;
