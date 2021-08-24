import { AbstractEvent, AbstractGlobalContext, AbstractLocationContext } from '@objectiv/schema';
import {
  makeClickEvent,
  makeInputChangeEvent,
  makeSectionHiddenEvent,
  makeSectionVisibleEvent,
  WebTracker,
} from '@objectiv/tracker-web';
import { findTrackedParentElements } from './findTrackedParentElements';
import { TrackingAttribute } from './TrackingAttributes';

/**
 * All of our EventFactories have a similar signature
 */
type EventFactory = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}) => Omit<AbstractEvent, 'id' | 'tracking_time' | 'transport_time'>;

/**
 * The parameters of `trackEvent`
 */
export type TrackEventParameters = {
  eventFactory: EventFactory;
  tracker: WebTracker;
  element: HTMLElement | EventTarget;
};

/**
 * 1. Traverses the DOM to reconstruct the component stack
 * 2. Uses the component stack to reconstruct a LocationStack
 * 3. Factors a new event with the given eventFactory
 * 4. Tracks the new Event via WebTracker
 *
 * TODO add a parameter to allow matching closes Tracked Element Parent, instead of doing that magically
 *
 */
export const trackEvent = ({ eventFactory, tracker, element }: TrackEventParameters) => {
  // Make sure we got an HTML Element, else we can't traverse the DOM nor get dataset attributes
  if (!(element instanceof HTMLElement)) {
    return;
  }

  // Retrieve parent Tracked Elements
  const elementsStack = findTrackedParentElements(element).reverse();

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
 * The parameters of the Event helper functions
 */
export type TrackHelperParameters = Pick<TrackEventParameters, 'tracker' | 'element'>;

/**
 * Event specific helpers. To make it easier to track common Events
 */
export const trackClick = ({ tracker, element }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeClickEvent, tracker, element });
};

export const trackInputChange = ({ tracker, element }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeInputChangeEvent, tracker, element });
};

export const trackSectionVisibleEvent = ({ tracker, element }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeSectionVisibleEvent, tracker, element });
};

export const trackSectionHiddenEvent = ({ tracker, element }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeSectionHiddenEvent, tracker, element });
};

export const trackVisibility = ({ tracker, element, isVisible }: TrackHelperParameters & { isVisible: boolean }) => {
  return trackEvent({ eventFactory: isVisible ? makeSectionVisibleEvent : makeSectionHiddenEvent, tracker, element });
};
