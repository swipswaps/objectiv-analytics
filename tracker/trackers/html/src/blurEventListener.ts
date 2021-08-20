import { makeInputChangeEvent, WebTracker } from '@objectiv/tracker-web';
import { findTrackedElementsInDOM } from './findTrackedElementsInDOM';
import { isTrackedElement } from './isTrackedElement';
import { TrackingAttribute } from './TrackingAttributes';

/**
 * Our Blur Event listener will traverse the DOM and reconstruct a LocationStack, then use WebTracker to transport it.
 */
export const blurEventListener = (tracker: WebTracker, event: Event, element: HTMLElement) => {
  if (!isTrackedElement(event.target)) {
    return;
  }

  const targetElementId = event.target.getAttribute(TrackingAttribute.objectivElementId);
  const elementId = element.getAttribute(TrackingAttribute.objectivElementId);
  if (targetElementId !== elementId) {
    return;
  }

  const trackedElements = findTrackedElementsInDOM(element).reverse();

  // TODO reconstruct Location Stack from trackedElements

  tracker.trackEvent(makeInputChangeEvent({ location_stack: [] }));

  console.log(element.dataset, trackedElements);
};
