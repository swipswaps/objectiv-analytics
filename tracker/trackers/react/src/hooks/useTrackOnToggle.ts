import { TrackerEventConfig } from '@objectiv/tracker-core';
import { ReactTracker } from '../ReactTracker';
import { useOnToggle } from './useOnToggle';
import { useTracker } from './useTracker';

//FIXME switch to props
//FIXME add useLocationStack

/**
 * A variant of the trackOnChange side effect that monitors a boolean `state` and runs the given `trueEvent` or
 * `falseEvent` depending on the state value.
 **/
export const useTrackOnToggle = (
  state: boolean,
  trueEvent: TrackerEventConfig,
  falseEvent: TrackerEventConfig,
  tracker: ReactTracker = useTracker()
) =>
  useOnToggle(
    state,
    () => tracker.trackEvent(trueEvent),
    () => tracker.trackEvent(falseEvent)
  );
