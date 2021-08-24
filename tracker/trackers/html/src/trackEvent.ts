import { AbstractEvent, AbstractGlobalContext, AbstractLocationContext } from '@objectiv/schema';
import {
  makeClickEvent,
  makeInputChangeEvent,
  makeSectionHiddenEvent,
  makeSectionVisibleEvent,
  WebTracker,
} from '@objectiv/tracker-web';
import { findTrackedParentElements } from './findTrackedParentElements';
import { isTrackableElement } from "./isTrackedElement";
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

  // Make sure we got an HTML or SVG Element, else we can't traverse the DOM nor get dataset attributes
  if (!isTrackableElement(element)) {
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

// TODO create helpers for all the clickable contexts, these should add also a location context item
// trackButtonClick
// trackLinkClick
// trackExpandableElement

export const trackInputChange = ({ element, tracker }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeInputChangeEvent, element, tracker });
};

export const trackSectionVisibleEvent = ({ element, tracker }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeSectionVisibleEvent, element, tracker });
};

export const trackSectionHiddenEvent = ({ element, tracker }: TrackHelperParameters) => {
  return trackEvent({ eventFactory: makeSectionHiddenEvent, element, tracker });
};

export const trackVisibility = ({ element, tracker, isVisible }: TrackHelperParameters & { isVisible: boolean }) => {
  return trackEvent({ eventFactory: isVisible ? makeSectionVisibleEvent : makeSectionHiddenEvent, element, tracker });
};
