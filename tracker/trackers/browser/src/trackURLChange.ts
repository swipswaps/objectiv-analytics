import { makeURLChangeEvent } from '@objectiv/tracker-core';
import { NonInteractiveEventTrackerParameters } from './definitions/NonInteractiveEventTrackerParameters';
import { trackerErrorHandler } from './helpers/trackerErrorHandler';
import { trackEvent } from './trackEvent';

/**
 * trackURLChange is a shorthand for trackEvent. It eases triggering URLChange events programmatically
 */
export const trackURLChange = (parameters: NonInteractiveEventTrackerParameters = {}) => {
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
