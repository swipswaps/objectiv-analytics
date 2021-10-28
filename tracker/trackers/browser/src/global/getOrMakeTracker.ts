import { TrackerConfig } from '@objectiv/tracker-core';
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

  // We found a Tracker instance but, before returning it, ensure its config matches the given configuration
  if (!compareTrackerConfig(tracker.trackerConfig, trackerConfig)) {
    throw new Error(`Tracker \`${trackerId}\` exists but its configuration doesn't match the given one.`);
  }

  return tracker;
};

/**
 * Compares two TrackerConfig objects ignoring mutable attributes.
 * Returns true if configurations are equivalent, false otherwise.
 */
export const compareTrackerConfig = (trackerConfigA: TrackerConfig, trackerConfigB: TrackerConfig) => {
  // Clone both configurations onto new mutable objects
  let trackerConfigAClone = { ...trackerConfigA };
  let trackerConfigBClone = { ...trackerConfigB };

  // Get rid of mutable attributes
  delete trackerConfigAClone.active;
  delete trackerConfigBClone.active;

  // Compare resulting objects by stringify them
  return JSON.stringify(trackerConfigAClone) === JSON.stringify(trackerConfigBClone);
};
