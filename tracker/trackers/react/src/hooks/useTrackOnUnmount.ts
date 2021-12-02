import { Tracker, TrackerEventConfig } from '@objectiv/tracker-core';
import { useOnUnmount } from './useOnUnmount';
import { useTracker } from './useTracker';

/**
 * A side effect that triggers the given TrackerEvent on unmount.
 */
export const useTrackOnUnmount = (event: TrackerEventConfig, tracker: Tracker = useTracker()) =>
  useOnUnmount(() => {
    tracker.trackEvent(event);
  });
