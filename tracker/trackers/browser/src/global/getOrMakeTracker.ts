import { BrowserTracker, BrowserTrackerConfig } from '../tracker/BrowserTracker';
import { getTrackerRepository } from './getTrackerRepository';
import { makeTracker } from './makeTracker';

/**
 * Retrieves a specific Tracker's instance from the TrackerRepository or creates one if it doesn't exists.
 * Throws if the given Tracker ID exists but its configuration doesn't match the given one.
 */
export const getOrMakeTracker = (trackerConfig: BrowserTrackerConfig): BrowserTracker => {
  // Get the TrackerRepository
  const trackerRepository = getTrackerRepository();

  // Determine trackerId
  const trackerId = trackerConfig.trackerId ?? trackerConfig.applicationId;

  // Attempt to retrieve tracker from Repository map, low-level to not trigger any console messages
  const tracker = trackerRepository.trackersMap.get(trackerId);

  // If we did not find a tracker, make a new one.
  if (!tracker) {
    return makeTracker(trackerConfig);
  }

  // We found a Tracker instance but, before returning it, ensure it matches the given configuration
  if (JSON.stringify(tracker) !== JSON.stringify(new BrowserTracker(trackerConfig))) {
    throw new Error(`Tracker \`${trackerId}\` exists but its configuration doesn't match the given one.`);
  }

  return tracker;
};
