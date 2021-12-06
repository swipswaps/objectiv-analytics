import { trackClickEvent } from '../eventTrackers/trackClickEvent';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './useTracker';

/**
 * Returns a ClickEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 */
export const useClickEventTracker =
  (tracker: ReactTracker = useTracker()) =>
  () =>
    trackClickEvent({ tracker });
