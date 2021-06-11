import { ButtonContext } from '@objectiv/schema';
import { makeClickEvent } from '@objectiv/tracker-core';
import { ReactTracker } from './ReactTracker';
import { useTracker } from './TrackerContextProvider';

/**
 * Event handler to be used for Button-like elements.
 */
export const onButtonClick = (buttonContext: ButtonContext, tracker: ReactTracker = useTracker()) => {
  const buttonTracker = new ReactTracker(tracker, { locationStack: [buttonContext] });

  return () => buttonTracker.trackEvent(makeClickEvent());
};
