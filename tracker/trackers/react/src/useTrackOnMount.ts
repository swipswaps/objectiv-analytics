import { TrackerEventConfig } from '@objectiv/tracker-core';
import { ReactTracker } from './ReactTracker';
import { useTracker } from './TrackerContextProvider';
import { useOnMount } from './useOnMount';

/**
 * A side effect that triggers the given TrackerEvent on mount.
 */
export const useTrackOnMount = (event: TrackerEventConfig, tracker: ReactTracker = useTracker()) => {
  useOnMount(() => {
    tracker.trackEvent(event);
  });
};
