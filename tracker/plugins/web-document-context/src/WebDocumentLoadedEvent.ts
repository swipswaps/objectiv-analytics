import { AbstractLocationContext, WebDocumentContext } from '@objectiv/schema';
import { makeDocumentLoadedEvent, Tracker } from '@objectiv/tracker-core';

/**
 * A type guard to determine if a Location Stack contains a WebDocumentContext.
 * TODO: create a WebDocumentTracker type, so we may get rid of this guard
 */
const LocationStackIncludesWebDocumentContext = (
  locationStack: AbstractLocationContext[]
): locationStack is [WebDocumentContext, ...AbstractLocationContext[]] => {
  return locationStack.find((locationContext) => locationContext._context_type === 'WebDocumentContext') !== undefined;
};

/**
 * WebDocumentLoadedEvent is triggered by DOMContentLoaded. The actual URL can be retrieved from the WebDocumentContext
 */
export const trackWebDocumentLoadedEvent = (tracker: Tracker): void => {
  if (!LocationStackIncludesWebDocumentContext(tracker.locationStack)) {
    throw new Error('DocumentLoaded Events require Trackers with WebDocumentContext in their Location Stack');
  }

  const webDocumentLoadedEvent = makeDocumentLoadedEvent({
    locationStack: tracker.locationStack,
    globalContexts: tracker.globalContexts,
  });

  const trackEvent = () => tracker.trackEvent(webDocumentLoadedEvent);

  if (document.readyState === 'complete') {
    trackEvent();
  } else {
    window.addEventListener('DOMContentLoaded', trackEvent);
  }
};
