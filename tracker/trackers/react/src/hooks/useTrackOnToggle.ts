import { Tracker, TrackerEventConfig } from '@objectiv/tracker-core';
import { useOnToggle } from './useOnToggle';
import { useTracker } from './useTracker';

/**
 * A variant of the trackOnChange side effect that monitors a boolean `state` and runs the given `trueEvent` or
 * `falseEvent` depending on the state value.
 **/
export const useTrackOnToggle = (
  state: boolean,
  trueEvent: TrackerEventConfig,
  falseEvent: TrackerEventConfig,
  tracker: Tracker = useTracker()
) =>
  useOnToggle(
    state,
    () => tracker.trackEvent(trueEvent),
    () => tracker.trackEvent(falseEvent)
  );
