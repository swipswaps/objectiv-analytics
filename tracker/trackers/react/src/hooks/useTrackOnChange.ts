import { TrackerEventConfig } from '@objectiv/tracker-core';
import { ReactTracker } from '../ReactTracker';
import { useOnChange } from './useOnChange';
import { useTracker } from './useTracker';

//FIXME switch to props
//FIXME add useLocationStack

/**
 * A side effect that monitors the given `state` and triggers the given TrackerEvent when state changes.
 */
export const useTrackOnChange = <T>(state: T, event: TrackerEventConfig, tracker: ReactTracker = useTracker()) =>
  useOnChange<T>(state, () => {
    tracker.trackEvent(event);
  });
