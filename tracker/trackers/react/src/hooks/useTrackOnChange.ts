import { Tracker, TrackerEventConfig } from '@objectiv/tracker-core';
import { useOnChange } from './useOnChange';
import { useTracker } from './useTracker';

/**
 * A side effect that monitors the given `state` and triggers the given TrackerEvent when state changes.
 */
export const useTrackOnChange = <T>(state: T, event: TrackerEventConfig, tracker: Tracker = useTracker()) =>
  useOnChange<T>(state, () => {
    tracker.trackEvent(event);
  });
