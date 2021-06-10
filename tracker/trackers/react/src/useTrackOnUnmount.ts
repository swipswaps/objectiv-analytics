import { TrackerEvent } from '@objectiv/core';
import { useTracker } from './ObjectivProvider';
import { ReactTracker } from './ReactTracker';
import { useOnUnmount } from './useOnUnmount';

/**
 * A side effect that triggers the given TrackerEvent on unmount.
 */
export const useTrackOnUnmount = (event: TrackerEvent, tracker: ReactTracker = useTracker()) => {
  useOnUnmount(() => {
    tracker.trackEvent(event);
  });
};
