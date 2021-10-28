import {
  GlobalContexts,
  LocationStack,
  makeAbortedEvent,
  makeApplicationLoadedEvent,
  makeClickEvent,
  makeCompletedEvent,
  makeInputChangeEvent,
  makeSectionHiddenEvent,
  makeSectionVisibleEvent,
  makeURLChangeEvent,
  makeVideoPauseEvent,
  makeVideoStartEvent,
} from '@objectiv/tracker-core';
import { trackEvent } from '../tracker/trackEvent';
import { trackerErrorHandler, TrackOnErrorCallback } from '../trackerErrorHandler';
import { TaggableElement } from '../typeGuards';
import { BrowserTracker } from './BrowserTracker';

/**
 * The parameters of the Event helper functions
 */
export type TrackEventHelperParameters = {
  element: TaggableElement | EventTarget;
  locationStack?: LocationStack;
  globalContexts?: GlobalContexts;
  tracker?: BrowserTracker;
  onError?: TrackOnErrorCallback;
};

/**
 * Event specific helpers. To make it easier to track common Events
 */
export const trackClick = ({
  element,
  locationStack,
  globalContexts,
  tracker,
  onError,
}: TrackEventHelperParameters) => {
  return trackEvent({
    event: makeClickEvent({ location_stack: locationStack, global_contexts: globalContexts }),
    element,
    tracker,
    onError,
  });
};

export const trackInputChange = ({
  element,
  locationStack,
  globalContexts,
  tracker,
  onError,
}: TrackEventHelperParameters) => {
  return trackEvent({
    event: makeInputChangeEvent({ location_stack: locationStack, global_contexts: globalContexts }),
    element,
    tracker,
    onError,
  });
};

export const trackSectionVisible = ({
  element,
  locationStack,
  globalContexts,
  tracker,
  onError,
}: TrackEventHelperParameters) => {
  return trackEvent({
    event: makeSectionVisibleEvent({ location_stack: locationStack, global_contexts: globalContexts }),
    element,
    tracker,
    onError,
  });
};

export const trackSectionHidden = ({
  element,
  locationStack,
  globalContexts,
  tracker,
  onError,
}: TrackEventHelperParameters) => {
  return trackEvent({
    event: makeSectionHiddenEvent({ location_stack: locationStack, global_contexts: globalContexts }),
    element,
    tracker,
    onError,
  });
};

export const trackVideoStart = ({
  element,
  locationStack,
  globalContexts,
  tracker,
  onError,
}: TrackEventHelperParameters) => {
  return trackEvent({
    event: makeVideoStartEvent({ location_stack: locationStack, global_contexts: globalContexts }),
    element,
    tracker,
    onError,
  });
};

export const trackVideoPause = ({
  element,
  locationStack,
  globalContexts,
  tracker,
  onError,
}: TrackEventHelperParameters) => {
  return trackEvent({
    event: makeVideoPauseEvent({ location_stack: locationStack, global_contexts: globalContexts }),
    element,
    tracker,
    onError,
  });
};

export const trackVisibility = ({
  element,
  locationStack,
  globalContexts,
  tracker,
  isVisible,
  onError,
}: TrackEventHelperParameters & { isVisible: boolean }) => {
  return trackEvent({
    event: isVisible
      ? makeSectionVisibleEvent({ location_stack: locationStack, global_contexts: globalContexts })
      : makeSectionHiddenEvent({ location_stack: locationStack, global_contexts: globalContexts }),
    element,
    tracker,
    onError,
  });
};

/**
 * The parameters of the Application Loaded and URLChange Event helper functions.
 * It's the same object of Interactive Track Helpers, but all attributes are optional.
 */
export type NonInteractiveTrackHelperParameters = Partial<TrackEventHelperParameters>;

export const trackApplicationLoaded = (parameters: NonInteractiveTrackHelperParameters = {}) => {
  try {
    const { element = document, locationStack, globalContexts, tracker } = parameters;
    return trackEvent({
      event: makeApplicationLoadedEvent({ location_stack: locationStack, global_contexts: globalContexts }),
      element,
      tracker,
    });
  } catch (error) {
    trackerErrorHandler(error, parameters, parameters.onError);
  }
};

export const trackURLChange = (parameters: NonInteractiveTrackHelperParameters = {}) => {
  try {
    const { element = document, locationStack, globalContexts, tracker } = parameters;
    return trackEvent({
      event: makeURLChangeEvent({ location_stack: locationStack, global_contexts: globalContexts }),
      element,
      tracker,
    });
  } catch (error) {
    trackerErrorHandler(error, parameters, parameters.onError);
  }
};

export const trackCompleted = (parameters: NonInteractiveTrackHelperParameters = {}) => {
  try {
    const { element = document, locationStack, globalContexts, tracker } = parameters;
    return trackEvent({
      event: makeCompletedEvent({ location_stack: locationStack, global_contexts: globalContexts }),
      element,
      tracker,
    });
  } catch (error) {
    trackerErrorHandler(error, parameters, parameters.onError);
  }
};

export const trackAborted = (parameters: NonInteractiveTrackHelperParameters = {}) => {
  try {
    const { element = document, locationStack, globalContexts, tracker } = parameters;
    return trackEvent({
      event: makeAbortedEvent({ location_stack: locationStack, global_contexts: globalContexts }),
      element,
      tracker,
    });
  } catch (error) {
    trackerErrorHandler(error, parameters, parameters.onError);
  }
};
