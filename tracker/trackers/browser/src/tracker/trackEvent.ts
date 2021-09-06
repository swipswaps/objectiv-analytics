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
import ExtendableError from 'es6-error';
import { BrowserTracker, getDocument, windowExists } from '../';
import { TrackingAttribute } from '../TrackingAttributes';
import { isTrackableElement } from '../typeGuards';
import findTrackedParentElements from './findTrackedParentElements';

/**
 * All of our EventFactories have the same signature
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
 * A custom error thrown by trackEvent calls.
 */
export class TrackEventError extends ExtendableError {}

/**
 * 1. Traverses the DOM to reconstruct the component stack
 * 2. Uses the component stack to reconstruct a LocationStack
 * 3. Factors a new event with the given eventFactory
 * 4. Tracks the new Event via WebTracker
 */
export const trackEvent = ({ eventFactory, element, tracker }: TrackEventParameters) => {
  let trackerInstance = tracker;
  if (!trackerInstance && windowExists()) {
    trackerInstance = window.objectiv.tracker;
  }
  // If we didn't get a Tracker we can't continue
  if (!trackerInstance) {
    throw new TrackEventError(
      'Tracker not initialized. Please provide a tracker instance' +
        (windowExists() ? ' or setup a global one via `configureTracker`' : '.')
    );
  }

  // For trackable Elements traverse the DOM to reconstruct their Location
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
  trackerInstance.trackEvent(newEvent);
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
  const { element = getDocument(), tracker = window.objectiv.tracker } = parameters ?? { element: getDocument() };
  if (!element) {
    throw new TrackEventError('Missing Element parameter. Provide a valid Element to track');
  }
  return trackEvent({ eventFactory: makeApplicationLoadedEvent, element, tracker });
};

export const trackURLChangeEvent = (parameters?: NonInteractiveTrackHelperParameters) => {
  const { element = getDocument(), tracker = window.objectiv.tracker } = parameters ?? { element: getDocument() };
  if (!element) {
    throw new TrackEventError('Missing Element parameter. Provide a valid Element to track');
  }
  return trackEvent({ eventFactory: makeURLChangeEvent, element, tracker });
};
