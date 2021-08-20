import { AbstractEvent, AbstractGlobalContext, AbstractLocationContext } from "@objectiv/schema";
import { WebTracker } from '@objectiv/tracker-web';
import { findTrackedElementsInDOM } from './findTrackedElementsInDOM';
import { isTrackedElement } from './isTrackedElement';
import { TrackingAttribute } from './TrackingAttributes';

/**
 * All of our EventFactories have a similar signature
 */
type EventFactory = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}) => Omit<AbstractEvent, 'id' | 'tracking_time' | 'transport_time'>;

/**
 * 1. Traverses the DOM to reconstruct the component stack
 * 2. Uses the component stack to reconstruct a LocationStack
 * 3. Factors a new event with the given eventFactory
 * 4. Tracks the new Event via WebTracker
 */
export const locateAndTrack = (eventFactory: EventFactory, tracker: WebTracker, event: Event, element: HTMLElement) => {
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
  console.log(event, element.dataset, trackedElements);

  const newEvent = eventFactory({ location_stack: [] });

  return tracker.trackEvent(newEvent);
};
