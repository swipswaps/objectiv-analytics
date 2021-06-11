import { ButtonContext } from '@objectiv/schema';
import { makeClickEvent } from '@objectiv/tracker-core';
import { ReactTracker } from './ReactTracker';
import { useTracker } from './TrackerContextProvider';

/**
 * Event handler to be used for Button-like elements.
 */
export const useTrackButtonClick =
  (buttonContext: ButtonContext, tracker: ReactTracker = useTracker()) =>
  () =>
    tracker.trackEvent(makeClickEvent({ locationStack: [buttonContext] }));
