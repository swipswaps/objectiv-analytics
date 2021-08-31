import { AbstractEvent, AbstractGlobalContext, AbstractLocationContext } from '@objectiv/schema';
import {
  makeApplicationLoadedEvent,
  makeClickEvent,
  makeInputChangeEvent,
  makeSectionHiddenEvent,
  makeSectionVisibleEvent, makeURLChangeEvent,
  makeVideoPauseEvent,
  makeVideoStartEvent,
  WebTracker,
} from '@objectiv/tracker-web';
import { ElementTrackingAttribute } from '../TrackingAttributes';
import { isTrackableElement } from '../typeGuards';
import findTrackedParentElements from './findTrackedParentElements';

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
  element: HTMLElement | EventTarget;
  tracker?: WebTracker;
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
export const trackEvent = ({ eventFactory, element, tracker = window.objectiv.tracker }: TrackEventParameters) => {
  // If we didn't get a Tracker we can't continue
  if (!tracker) {
    throw new Error('Tracker not initialized. Provide a tracker instance or setup a global one via `configureTracker`');
  }

  // For HTML or SVG Elements traverse the DOM to reconstruct their Location
  let locationStack: AbstractLocationContext[] = [];
  if (isTrackableElement(element)) {
    // Retrieve parent Tracked Elements
    const elementsStack = findTrackedParentElements(element).reverse();

    // Re-hydrate Location Stack
    locationStack = elementsStack.reduce((locationContexts, element) => {
      const locationContext = element.getAttribute(ElementTrackingAttribute.context);
      if (locationContext) {
        // TODO Surely nicer to use our factories for this. A wrapper around them, leveraging ContextType, should do.
        locationContexts.push(JSON.parse(locationContext));
      }
      return locationContexts;
    }, [] as AbstractLocationContext[]);
  }

  // Create new Event
  const newEvent = eventFactory({ location_stack: locationStack });

  // Track
  tracker.trackEvent(newEvent);
};

/**
 * The parameters of the Event helper functions
 */
export type TrackHelperParameters = {
  element: HTMLElement | EventTarget;
  tracker?: WebTracker;
};

/**
 * Event specific helpers. To make it easier to track common Events
 */
export const trackClick = ({ element, tracker }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeClickEvent, element, tracker });
};

export const trackInputChange = ({ element, tracker }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeInputChangeEvent, element, tracker });
};

export const trackSectionVisibleEvent = ({ element, tracker }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeSectionVisibleEvent, element, tracker });
};

export const trackSectionHiddenEvent = ({ element, tracker }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeSectionHiddenEvent, element, tracker });
};

export const trackVideoStartEvent = ({ element, tracker }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeVideoStartEvent, element, tracker });
};

export const trackVideoPauseEvent = ({ element, tracker }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeVideoPauseEvent, element, tracker });
};

export const trackVisibility = ({ element, tracker, isVisible }: TrackHelperParameters & { isVisible: boolean }) => {
  return trackEvent({ eventFactory: isVisible ? makeSectionVisibleEvent : makeSectionHiddenEvent, element, tracker });
};

export const trackApplicationLoadedEvent = (parameters?: TrackHelperParameters) => {
  const { element , tracker } = parameters ?? { element: document};
  return trackEvent({ eventFactory: makeApplicationLoadedEvent, element, tracker });
};

export const trackURLChangeEvent = (parameters?: TrackHelperParameters) => {
  const { element , tracker } = parameters ?? { element: document};
  return trackEvent({ eventFactory: makeURLChangeEvent, element, tracker });
};
