import { trackURLChangeEvent } from '../eventTrackers/trackURLChangeEvent';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './useTracker';

/**
 * Returns a URLChangeEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 */
export const useURLChangeEventTracker =
  (tracker: ReactTracker = useTracker()) =>
  () =>
    trackURLChangeEvent({ tracker });
