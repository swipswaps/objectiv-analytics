import { TrackerRepository } from '@objectiv/tracker-core';
import { windowExists } from './helpers';
import { startAutoTracking } from './observer/startAutoTracking';
import { FlushQueueOptions, WaitForQueueOptions } from './structs';
import { BrowserTracker, BrowserTrackerConfig } from './tracker/BrowserTracker';

/**
 * The interface of our namespace which will be extending the Window interface
 */
export interface ObjectivNamespace {
  trackers: TrackerRepository<BrowserTracker>;
}

/**
 * Window extension for our namespace
 */
declare global {
  interface Window {
    objectiv: ObjectivNamespace;
  }
}

/**
 * Initialize window global namespace, unless already existing
 */
if (windowExists()) {
  window.objectiv = window.objectiv || {
    trackers: new TrackerRepository(),
  };
}

/**
 * Retrieves the TrackerRepository instance from the window.objectiv global namespace
 */
export const getTrackerRepository = (): TrackerRepository<BrowserTracker> => {
  if (!windowExists()) {
    throw new Error('Cannot access the Window interface.');
  }

  return window.objectiv.trackers;
};

/**
 * Allows to easily create and configure a new BrowserTracker instance and also starts auto tracking
 */
export const makeTracker = (trackerConfig: BrowserTrackerConfig): BrowserTracker => {
  const newTracker = new BrowserTracker(trackerConfig);
  const trackerRepository = getTrackerRepository();

  trackerRepository.add(newTracker);
  startAutoTracking(trackerConfig);

  return newTracker;
};

/**
 * Retrieves a specific instance of the tracker from the TrackerRepository.
 */
export const getTracker = (trackerId?: string): BrowserTracker => {
  const tracker = getTrackerRepository().get(trackerId);

  // Throw if we did not manage to get a tracker instance
  if (!tracker) {
    throw new Error('No Tracker found. Please create one via `makeTracker`.');
  }

  return tracker;
};

/**
 * Helper method to easily set a different default Tracker in the TrackerRepository.
 */
export const setDefaultTracker = async (
  parameters:
    | string
    | {
        trackerId: string;
        waitForQueue?: false | WaitForQueueOptions;
        flushQueue?: FlushQueueOptions;
      }
) => {
  let trackerId: string;
  let waitForQueue: undefined | WaitForQueueOptions;
  let flushQueue: undefined | FlushQueueOptions;

  // Some sensible defaults
  const defaultWaitForQueue = {}; // Wait for Queue with default options before switching default Tracker.
  const defaultFlushQueue = true; // Flush the Queue before switching default Tracker.

  if (typeof parameters === 'string') {
    trackerId = parameters;
    waitForQueue = defaultWaitForQueue;
    flushQueue = defaultFlushQueue;
  } else {
    trackerId = parameters.trackerId;
    waitForQueue = parameters.waitForQueue ?? defaultWaitForQueue;
    flushQueue = parameters.flushQueue ?? defaultFlushQueue;
  }

  // Get current default Tracker
  const tracker = getTracker();

  // Process waitForQueue
  let isQueueEmpty = true;
  if (waitForQueue) {
    isQueueEmpty = await tracker.waitForQueue(waitForQueue);
  }

  // Process flushQueue
  if (flushQueue === true || (flushQueue === 'onTimeout' && !isQueueEmpty)) {
    tracker.flushQueue();
  }

  // Set the new default Tracker
  getTrackerRepository().setDefault(trackerId);
};
