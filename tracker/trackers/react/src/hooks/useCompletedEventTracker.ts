import { trackCompletedEvent } from '../eventTrackers/trackCompletedEvent';
import { ReactTracker } from '../ReactTracker';
import { LocationStack } from '../types';
import { useLocationStack } from './useLocationStack';
import { useTracker } from './useTracker';

/**
 * Returns a CompletedEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 * Retrieves LocationStack from parent LocationStackProviders. A custom LocationStack can be provided.
 */
export const useCompletedEventTracker =
  (tracker: ReactTracker = useTracker(), locationStack: LocationStack = useLocationStack()) =>
  () =>
    trackCompletedEvent({ tracker, locationStack });
