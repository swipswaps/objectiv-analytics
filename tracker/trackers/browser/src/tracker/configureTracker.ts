import { BrowserTracker, BrowserTrackerConfig } from './BrowserTracker';

/**
 * Allows to easily configure a main tracker instance.
 */
export const configureTracker = (trackerConfig: BrowserTrackerConfig) => {
  new BrowserTracker(trackerConfig);
};
