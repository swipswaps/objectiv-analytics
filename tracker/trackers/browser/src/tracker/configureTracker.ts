import { windowExists } from '../globals';
import { startAutoTracking } from '../observer/startAutoTracking';
import { BrowserTracker, BrowserTrackerConfig } from './BrowserTracker';

/**
 * Allows to easily configure a main tracker instance and also starts auto tracking
 */
export const configureTracker = (trackerConfig: BrowserTrackerConfig) => {
  if (!windowExists()) {
    throw new Error('Cannot access the Window interface. Tracker cannot be initialized.');
  }

  // Create new Tracker Instance
  const newTracker = new BrowserTracker(trackerConfig);

  // Add new Tracker Instance to the TrackerRepository
  window.objectiv.trackers.add(newTracker);

  // Initialize auto Tracker
  startAutoTracking(trackerConfig, window.objectiv.trackers.get(newTracker.trackerId));
};
