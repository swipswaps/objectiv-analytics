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
export const locateAndTrack = (eventFactory: EventFactory, tracker: WebTracker, target: EventTarget | null, element: HTMLElement) => {
  if (!isTrackedElement(target)) {
    return;
  }

  // We double check if the target and the trigger element are the same. This ensures we don't track bubbled events
  const targetElementId = target.getAttribute(TrackingAttribute.objectivElementId);
  const elementId = element.getAttribute(TrackingAttribute.objectivElementId);
  if (targetElementId !== elementId) {
    return;
  }

  const elementsStack = findTrackedElementsInDOM(element).reverse();
  const locationStack = elementsStack.reduce((locationContexts, element) => {
    const locationContext = element.getAttribute(TrackingAttribute.objectivContext);
    if(locationContext) {
      // TODO Surely nicer to use our factories for this. A wrapper around them, leveraging ContextType, should do.
      locationContexts.push(JSON.parse(locationContext))
    }
    return locationContexts;
  }, [] as AbstractLocationContext[]);

  const newEvent = eventFactory({ location_stack: locationStack });

  return tracker.trackEvent(newEvent);
};
