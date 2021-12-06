import { trackCompletedEvent } from '../eventTrackers/trackCompletedEvent';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './useTracker';

/**
 * Returns a CompletedEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 */
export const useCompletedEventTracker =
  (tracker: ReactTracker = useTracker()) =>
  () =>
    trackCompletedEvent({ tracker });
