import { trackVisibility } from '../eventTrackers/trackVisibility';
import { EventTrackerHookParameters } from '../types';
import { useLocationStack } from './useLocationStack';
import { useTracker } from './useTracker';

/**
 * The parameters of `useTrackVisibility`
 */
export type TrackVisibilityHookParameters = EventTrackerHookParameters & {
  /**
   * Determines whether a SectionVisibleEvent or a SectionHidden event is tracked
   */
  isVisible: boolean;
};

/**
 * Returns a SectionVisibleEvent / SectionHiddenEvent Tracker ready to be triggered.
 * The `isVisible` parameter determines which Visibility Event is triggered.
 * Binds the tracker to the parent Tracker Instance returned by `useTracker`. A custom instance can be provided.
 * Retrieves LocationStack from parent LocationStackProviders. A custom LocationStack can be provided.
 */
export const useVisibilityTracker = (parameters: TrackVisibilityHookParameters) => {
  const { isVisible, tracker = useTracker(), locationStack = useLocationStack(), globalContexts } = parameters;

  return () => trackVisibility({ isVisible, tracker, locationStack, globalContexts });
};
