import { makeCompletedEvent } from '@objectiv/tracker-core';
import { NonInteractiveEventTrackerParameters } from './definitions/NonInteractiveEventTrackerParameters';
import { trackerErrorHandler } from './helpers/trackerErrorHandler';
import { trackEvent } from './trackEvent';

/**
 * trackCompleted is a shorthand for trackEvent. It eases triggering Completed events programmatically
 */
export const trackCompleted = (parameters: NonInteractiveEventTrackerParameters = {}) => {
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
