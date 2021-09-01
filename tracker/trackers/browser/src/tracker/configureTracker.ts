import { startAutoTracking } from '../observer/startAutoTracking';
import { BrowserTracker, BrowserTrackerConfig } from './BrowserTracker';

/**
 * Allows to easily configure a main tracker instance and also starts auto tracking
 */
export const configureTracker = (trackerConfig: BrowserTrackerConfig) => {
  // Create and store Tracker instance in window interface
  window.objectiv.tracker = new BrowserTracker(trackerConfig);

  // Initialize auto Tracker
  startAutoTracking(trackerConfig);
};
