import { LocationStack } from '@objectiv/tracker-core';
import { trackVideoStartEvent } from '../eventTrackers/trackVideoStartEvent';
import { ReactTracker } from '../ReactTracker';
import { useLocationStack } from './useLocationStack';
import { useTracker } from './useTracker';

/**
 * Returns a VideoStartEvent Tracker ready to be triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 * Retrieves LocationStack from parent LocationStackProviders. A custom LocationStack can be provided.
 */
export const useVideoStartEventTracker =
  (tracker: ReactTracker = useTracker(), locationStack: LocationStack = useLocationStack()) =>
  () =>
    trackVideoStartEvent({ tracker, locationStack });
