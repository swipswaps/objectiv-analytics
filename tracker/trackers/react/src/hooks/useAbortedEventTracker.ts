import { trackAbortedEvent } from '../eventTrackers/trackAbortedEvent';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './useTracker';

/**
 * Returns an AbortedEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 */
export const useAbortedEventTracker =
  (tracker: ReactTracker = useTracker()) =>
  () =>
    trackAbortedEvent({ tracker });
