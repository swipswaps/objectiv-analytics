import { TrackerEvent } from '@objectiv/core';
import { ReactTracker } from './ReactTracker';
import { useTracker } from './TrackerContextProvider';
import { useOnUnmount } from './useOnUnmount';

/**
 * A side effect that triggers the given TrackerEvent on unmount.
 */
export const useTrackOnUnmount = (event: TrackerEvent, tracker: ReactTracker = useTracker()) => {
  useOnUnmount(() => {
    tracker.trackEvent(event);
  });
};
