import { getTrackerRepository } from './getTrackerRepository';
import { BrowserTracker, BrowserTrackerConfig } from './internal/BrowserTracker';
import { startAutoTracking } from './startAutoTracking';

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
