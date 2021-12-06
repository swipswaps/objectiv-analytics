import { TrackerEventConfig } from '@objectiv/tracker-core';
import { ReactTracker } from '../ReactTracker';
import { useOnUnmount } from './useOnUnmount';
import { useTracker } from './useTracker';

//FIXME add useLocationStack

/**
 * A side effect that triggers the given TrackerEvent on unmount.
 */
export const useTrackOnUnmount = (event: TrackerEventConfig, tracker: ReactTracker = useTracker()) =>
  useOnUnmount(() => {
    tracker.trackEvent(event);
  });
