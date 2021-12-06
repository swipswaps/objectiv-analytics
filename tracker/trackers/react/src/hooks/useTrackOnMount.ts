import { TrackerEventConfig } from '@objectiv/tracker-core';
import { ReactTracker } from '../ReactTracker';
import { useOnMount } from './useOnMount';
import { useTracker } from './useTracker';

//FIXME add useLocationStack

/**
 * A side effect that triggers the given TrackerEvent on mount.
 */
export const useTrackOnMount = (event: TrackerEventConfig, tracker: ReactTracker = useTracker()) =>
  useOnMount(() => {
    tracker.trackEvent(event);
  });
