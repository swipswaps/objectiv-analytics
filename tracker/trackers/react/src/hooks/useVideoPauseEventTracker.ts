import { trackVideoPauseEvent } from '../eventTrackers/trackVideoPauseEvent';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './useTracker';

/**
 * Returns a VideoPauseEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 */
export const useVideoPauseEventTracker =
  (tracker: ReactTracker = useTracker()) =>
  () =>
    trackVideoPauseEvent({ tracker });
