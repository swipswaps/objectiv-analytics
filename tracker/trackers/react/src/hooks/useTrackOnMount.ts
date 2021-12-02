import { Tracker, TrackerEventConfig } from '@objectiv/tracker-core';
import { useOnMount } from './useOnMount';
import { useTracker } from './useTracker';

/**
 * A side effect that triggers the given TrackerEvent on mount.
 */
export const useTrackOnMount = (event: TrackerEventConfig, tracker: Tracker = useTracker()) =>
  useOnMount(() => {
    tracker.trackEvent(event);
  });
