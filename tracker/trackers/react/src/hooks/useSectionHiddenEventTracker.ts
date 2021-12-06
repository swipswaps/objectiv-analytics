import { trackSectionHiddenEvent } from '../eventTrackers/trackSectionHiddenEvent';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './useTracker';

/**
 * Returns a SectionHiddenEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 */
export const useSectionHiddenEventTracker =
  (tracker: ReactTracker = useTracker()) =>
  () =>
    trackSectionHiddenEvent({ tracker });
