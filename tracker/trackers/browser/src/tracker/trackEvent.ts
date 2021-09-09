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
import { BrowserTracker, AnyLocationContext } from '../';
import { parseLocationContext } from '../structs';
import { TrackingAttribute } from '../TrackingAttributes';
import { isTrackableElement } from '../typeGuards';
import findTrackedParentElements from './findTrackedParentElements';
import { trackerErrorHandler, TrackOnErrorCallback } from './trackerErrorHandler';

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
  element: HTMLElement | SVGElement | EventTarget;
  tracker?: BrowserTracker;
  onError?: TrackOnErrorCallback;
};

/**
 * A custom error thrown by trackEvent calls.
 */
export class TrackEventError extends ExtendableError {}

/**
 * 1. Traverses the DOM to reconstruct the component stack
 * 2. Uses the elements stack, inferred either via DOM or parent attributes, to reconstruct a LocationStack
 * 3. Factors a new event with the given eventFactory
 * 4. Tracks the new Event via WebTracker
 */
export const trackEvent = (parameters: TrackEventParameters) => {
  try {
    const { eventFactory, element, tracker = window.objectiv.tracker } = parameters;

    // For trackable Elements traverse the DOM to reconstruct their Location
    const locationStack: AnyLocationContext[] = [];
    if (isTrackableElement(element)) {
      // Retrieve parent Tracked Elements
      const elementsStack = findTrackedParentElements(element).reverse();

      // Re-hydrate Location Stack
      elementsStack.forEach((element) => {
        // Get, parse, validate, hydrate and push Location Context in the Location Stack
        locationStack.push(parseLocationContext(element.getAttribute(TrackingAttribute.context)));
      });
    }

    // Create new Event
    const newEvent = eventFactory({ location_stack: locationStack });

    // Track
    tracker.trackEvent(newEvent);
  } catch (error) {
    trackerErrorHandler(error, parameters, parameters.onError);
  }
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
  onError?: TrackOnErrorCallback;
};

export const trackApplicationLoadedEvent = (parameters: NonInteractiveTrackHelperParameters = {}) => {
  try {
    const { element = document, tracker } = parameters;
    return trackEvent({ eventFactory: makeApplicationLoadedEvent, element, tracker });
  } catch (error) {
    trackerErrorHandler(error, parameters, parameters.onError);
  }
};

export const trackURLChangeEvent = (parameters: NonInteractiveTrackHelperParameters = {}) => {
  try {
    const { element = document, tracker } = parameters;
    return trackEvent({ eventFactory: makeURLChangeEvent, element, tracker });
  } catch (error) {
    trackerErrorHandler(error, parameters, parameters.onError);
  }
};
