import { makeAbortedEvent } from '@objectiv/tracker-core';
import { NonInteractiveEventTrackerParameters } from './definitions/NonInteractiveEventTrackerParameters';
import { trackerErrorHandler } from './helpers/trackerErrorHandler';
import { trackEvent } from './trackEvent';

/**
 * trackAborted is a shorthand for trackEvent. It eases triggering Aborted events programmatically
 */
export const trackAborted = (parameters: NonInteractiveEventTrackerParameters = {}) => {
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
