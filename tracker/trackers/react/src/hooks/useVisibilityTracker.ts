import { trackVisibility } from '../eventTrackers/trackVisibility';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './useTracker';

// FIXME switch to prop object for parameters

/**
 * Returns a SectionVisibleEvent / SectionHiddenEvent Tracker ready to be triggered.
 * The `isVisible` parameter determines which Visibility Event is triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 */
export const useVisibilityTracker =
  (isVisible: boolean, tracker: ReactTracker = useTracker()) =>
  () =>
    trackVisibility({ isVisible, tracker });
