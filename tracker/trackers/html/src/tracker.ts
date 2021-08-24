import { WebTracker, WebTrackerConfig } from '@objectiv/tracker-web';
import { startObservingDOM } from './observer';

/**
 * Allows to configure the main tracker instance and initializes the mutation observer to start auto tracking.
 */
export const configureTracker = (webTrackerConfig: WebTrackerConfig) => {
  // TODO store this instance in a retrievable place, so we may programmatically retrieve it for trackerEvent calls
  const tracker = new WebTracker(webTrackerConfig);
  startObservingDOM(tracker);
};
