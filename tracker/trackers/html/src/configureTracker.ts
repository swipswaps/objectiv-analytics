import { WebTracker, WebTrackerConfig } from '@objectiv/tracker-web';
import { startObservingDOM } from './observer';

/**
 * Allows to configure the main tracker instance and initializes the mutation observer to start auto tracking.
 * Tracks Application Loaded Event
 */
export const configureTracker = (webTrackerConfig: WebTrackerConfig) => {
  window.objectiv.tracker = new WebTracker(webTrackerConfig);
  startObservingDOM(window.objectiv.tracker);
};
