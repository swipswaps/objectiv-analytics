import { BrowserTracker, BrowserTrackerConfig } from "@objectiv/tracker-browser";

/**
 * Allows to easily configure a main tracker instance.
 */
export const configureTracker = (trackerConfig: BrowserTrackerConfig) => {
  new BrowserTracker(trackerConfig);
};
