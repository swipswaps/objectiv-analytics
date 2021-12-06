import { trackInputChangeEvent } from '../eventTrackers/trackInputChangeEvent';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './useTracker';

/**
 * Returns an InputChangeEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 */
export const useInputChangeEventTracker =
  (tracker: ReactTracker = useTracker()) =>
  () =>
    trackInputChangeEvent({ tracker });
