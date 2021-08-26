import { WebTracker } from '@objectiv/tracker-web';
import { ElementTrackingAttribute } from '../TrackingAttributes';
import processChildrenTrackingElement from './processChildrenTrackingElement';
import processNewElement from './processNewElement';

/**
 * Given a Mutation Observer node containing newly added nodes it will track visibility and attach events to them:
 */
function processNewElements(element: Element, tracker: WebTracker = window.objectiv.tracker) {
  const elements = element.querySelectorAll(`[${ElementTrackingAttribute.elementId}]`);
  [element, ...Array.from(elements)].forEach((element) => {
    const childrenTrackedElements = processChildrenTrackingElement(element);
    if (childrenTrackedElements.length) {
      childrenTrackedElements.forEach((queriedElement) => {
        processNewElement(queriedElement, tracker);
      });
    } else {
      processNewElement(element, tracker);
    }
  });
}

export default processNewElements;
