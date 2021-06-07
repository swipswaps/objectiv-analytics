import { makeDocumentLoadedEvent, Tracker } from '@objectiv/tracker-core';

/**
 * WebDocumentLoadedEvent is triggered by DOMContentLoaded. The actual URL can be retrieved from the WebDocumentContext
 */
export const trackWebDocumentLoadedEvent = (tracker: Tracker): void => {
  const trackEvent = () => tracker.trackEvent(makeDocumentLoadedEvent());

  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', trackEvent);
  } else {
    trackEvent();
  }
};
