import { trackApplicationLoadedEvent } from '../eventTrackers/trackApplicationLoadedEvent';
import { ReactTracker } from '../ReactTracker';
import { LocationStack } from '../types';
import { useLocationStack } from './useLocationStack';
import { useTracker } from './useTracker';

/**
 * Returns an ApplicationLoadedEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 * Retrieves LocationStack from parent LocationStackProviders. A custom LocationStack can be provided.
 *
 * For an automatically triggering ApplicationLoadedEvent on mount:
 * @see useTrackApplicationLoaded
 *
 */
export const useApplicationLoadedEventTracker =
  (tracker: ReactTracker = useTracker(), locationStack: LocationStack = useLocationStack()) =>
  () =>
    trackApplicationLoadedEvent({ tracker, locationStack });
