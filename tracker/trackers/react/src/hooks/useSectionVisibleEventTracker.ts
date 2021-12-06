import { trackSectionVisibleEvent } from '../eventTrackers/trackSectionVisibleEvent';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './useTracker';

/**
 * Returns a SectionVisibleEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 */
export const useSectionVisibleEventTracker =
  (tracker: ReactTracker = useTracker()) =>
  () =>
    trackSectionVisibleEvent({ tracker });
