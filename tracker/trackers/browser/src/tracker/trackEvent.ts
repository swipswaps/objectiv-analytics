import { AbstractEvent, AbstractGlobalContext, AbstractLocationContext } from '@objectiv/schema';
import {
  makeApplicationLoadedEvent,
  makeClickEvent,
  makeInputChangeEvent,
  makeSectionHiddenEvent,
  makeSectionVisibleEvent,
  makeURLChangeEvent,
  makeVideoPauseEvent,
  makeVideoStartEvent,
} from '@objectiv/tracker-core';
import { BrowserTracker } from '../';
import { TrackingAttribute } from '../TrackingAttributes';
import { isTrackableElement } from '../typeGuards';
import findTrackedParentElements from './findTrackedParentElements';

/**
 * All of our EventFactories have a similar signature
 */
type EventFactory = (props?: {
  location_stack?: AbstractLocationContext[];
  global_contexts?: AbstractGlobalContext[];
}) => Omit<AbstractEvent, 'id' | 'time'>;

/**
 * The parameters of `trackEvent`
 */
export type TrackEventParameters = {
  eventFactory: EventFactory;
  element: HTMLElement | EventTarget;
  tracker?: BrowserTracker;
};

/**
 * 1. Traverses the DOM to reconstruct the component stack
 * 2. Uses the component stack to reconstruct a LocationStack
 * 3. Factors a new event with the given eventFactory
 * 4. Tracks the new Event via WebTracker
 */
export const trackEvent = ({ eventFactory, element, tracker = window.objectiv.tracker }: TrackEventParameters) => {
  // TODO wrap in trackErrorHandler try catch
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
      // TODO we need a proper parsers for these attributes with good validation
      // TODO surely nicer to use our factories for this. A wrapper around them, leveraging ContextType, should do.
      const locationContext = element.getAttribute(TrackingAttribute.context) as string;
      locationContexts.push(JSON.parse(locationContext));
      return locationContexts;
    }, [] as AbstractLocationContext[]);

    // TODO temporary until we have factories to avoid parsing invalid data from attributes
    locationStack = locationStack.filter((locationContext) => locationContext);
  }

  // Create new Event
  const newEvent = eventFactory({ location_stack: locationStack });

  // Track
  tracker.trackEvent(newEvent);
};

/**
 * The parameters of the Event helper functions
 */
export type TrackEventHelperParameters = {
  element: HTMLElement | EventTarget;
  tracker?: BrowserTracker;
};

/**
 * Event specific helpers. To make it easier to track common Events
 */
export const trackClick = ({ element, tracker }: TrackEventHelperParameters) => {
  return trackEvent({ eventFactory: makeClickEvent, element, tracker });
};

export const trackInputChange = ({ element, tracker }: TrackEventHelperParameters) => {
  return trackEvent({ eventFactory: makeInputChangeEvent, element, tracker });
};

export const trackSectionVisibleEvent = ({ element, tracker }: TrackEventHelperParameters) => {
  return trackEvent({ eventFactory: makeSectionVisibleEvent, element, tracker });
};

export const trackSectionHiddenEvent = ({ element, tracker }: TrackEventHelperParameters) => {
  return trackEvent({ eventFactory: makeSectionHiddenEvent, element, tracker });
};

export const trackVideoStartEvent = ({ element, tracker }: TrackEventHelperParameters) => {
  return trackEvent({ eventFactory: makeVideoStartEvent, element, tracker });
};

export const trackVideoPauseEvent = ({ element, tracker }: TrackEventHelperParameters) => {
  return trackEvent({ eventFactory: makeVideoPauseEvent, element, tracker });
};

export const trackVisibility = ({
  element,
  tracker,
  isVisible,
}: TrackEventHelperParameters & { isVisible: boolean }) => {
  return trackEvent({ eventFactory: isVisible ? makeSectionVisibleEvent : makeSectionHiddenEvent, element, tracker });
};

/**
 * The parameters of the Application Loaded and URLChange Event helper functions
 */
export type NonInteractiveTrackHelperParameters = {
  element?: HTMLElement | EventTarget;
  tracker?: BrowserTracker;
};

export const trackApplicationLoadedEvent = (parameters?: NonInteractiveTrackHelperParameters) => {
  const { element = document, tracker } = parameters ?? { element: document };
  return trackEvent({ eventFactory: makeApplicationLoadedEvent, element, tracker });
};

export const trackURLChangeEvent = (parameters?: NonInteractiveTrackHelperParameters) => {
  const { element = document, tracker } = parameters ?? { element: document };
  return trackEvent({ eventFactory: makeURLChangeEvent, element, tracker });
};
