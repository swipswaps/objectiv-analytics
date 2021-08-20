import { WebTracker, WebTrackerConfig } from '@objectiv/tracker-web';
import { startObservingDOM } from './observer';

/**
 * Allows to configure the main tracker instance and initializes the mutation observer to start auto tracking.
 */
export const configureTracker = (webTrackerConfig: WebTrackerConfig) => {
  const tracker = new WebTracker(webTrackerConfig);
  startObservingDOM(tracker);
};
