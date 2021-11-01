import { TrackerQueue, TrackerQueueInterface, } from '@objectiv/tracker-core';
import { BrowserTrackerConfig } from '../definitions/BrowserTrackerConfig';
import { TrackerQueueLocalStorageStore } from '../queue/TrackerQueueLocalStorageStore';

/**
 * A factory to create the default Queue of Browser Tracker.
 */
export const makeBrowserTrackerDefaultQueue = (trackerConfig: BrowserTrackerConfig): TrackerQueueInterface =>
  new TrackerQueue({
    store: new TrackerQueueLocalStorageStore({
      trackerId: trackerConfig.trackerId ?? trackerConfig.applicationId,
      console: trackerConfig.console,
    }),
    console: trackerConfig.console,
  });
