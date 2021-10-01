import { TrackerRepository } from '@objectiv/tracker-core';
import { windowExists } from './helpers';
import { BrowserTracker } from './tracker/BrowserTracker';

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
 * Retrieves a specific instance of the tracker from the TrackerRepository.
 */
export const getTracker = (trackerId?: string): BrowserTracker => {
  if (!windowExists()) {
    throw new Error('Cannot access the Window interface.');
  }

  const tracker = window.objectiv.trackers.get(trackerId);

  // Throw if we did not manage to get a tracker instance
  if (!tracker) {
    throw new Error('No Tracker found. Please create one via `makeTracker`.');
  }

  return tracker;
};
