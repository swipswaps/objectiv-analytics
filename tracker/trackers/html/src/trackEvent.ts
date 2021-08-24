import { AbstractEvent, AbstractGlobalContext, AbstractLocationContext } from '@objectiv/schema';
import {
  makeClickEvent,
  makeInputChangeEvent,
  makeSectionHiddenEvent,
  makeSectionVisibleEvent,
  WebTracker
} from '@objectiv/tracker-web';
import { findTrackedElementsInDOM } from './findTrackedElementsInDOM';
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
export const trackEvent = (
  {eventFactory, tracker, element}:
  {eventFactory: EventFactory, tracker: WebTracker, element: HTMLElement}
) => {
  // Retrieve parent elements
  const elementsStack = findTrackedElementsInDOM(element).reverse();

  // Re-hydrate Location Stack
  const locationStack = elementsStack.reduce((locationContexts, element) => {
    const locationContext = element.getAttribute(TrackingAttribute.context);
    if (locationContext) {
      // TODO Surely nicer to use our factories for this. A wrapper around them, leveraging ContextType, should do.
      locationContexts.push(JSON.parse(locationContext));
    }
    return locationContexts;
  }, [] as AbstractLocationContext[]);

  // Create new Event
  const newEvent = eventFactory({ location_stack: locationStack });

  // Track
  tracker.trackEvent(newEvent);
};

/**
 * Event specific shortcuts. To make it easier to track common Events
 */
export const trackClick = ({ tracker, element }: { tracker: WebTracker, element: HTMLElement }) => {
  return trackEvent({ eventFactory: makeClickEvent, tracker, element });
};

export const trackInputChange = ({ tracker, element }: { tracker: WebTracker, element: HTMLElement }) => {
  return trackEvent({ eventFactory: makeInputChangeEvent, tracker, element });
};

export const trackSectionVisibleEvent = ({ tracker, element }: { tracker: WebTracker, element: HTMLElement }) => {
  return trackEvent({ eventFactory: makeSectionVisibleEvent, tracker, element });
};

export const trackSectionHiddenEvent = ({ tracker, element }: { tracker: WebTracker, element: HTMLElement }) => {
  return trackEvent({ eventFactory: makeSectionHiddenEvent, tracker, element });
};
