import { trackVisibility } from '../eventTrackers/trackVisibility';
import { ReactTracker } from '../ReactTracker';
import { LocationStack } from '../types';
import { useLocationStack } from './useLocationStack';
import { useTracker } from './useTracker';

/**
 * Returns a SectionVisibleEvent / SectionHiddenEvent Tracker ready to be triggered.
 * The `isVisible` parameter determines which Visibility Event is triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 * Retrieves LocationStack from parent LocationStackProviders. A custom LocationStack can be provided.
 */
export const useVisibilityTracker =
  (isVisible: boolean, tracker: ReactTracker = useTracker(), locationStack: LocationStack = useLocationStack()) =>
  () =>
    trackVisibility({ isVisible, tracker, locationStack });
