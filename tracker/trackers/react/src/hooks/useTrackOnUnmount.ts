/*
 * Copyright 2021 Objectiv B.V.
 */

import { TrackerEventConfig } from '@objectiv/tracker-core';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './consumers/useTracker';
import { useOnUnmount } from './useOnUnmount';

//FIXME add useLocationStack

/**
 * A side effect that triggers the given TrackerEvent on unmount.
 */
export const useTrackOnUnmount = (event: TrackerEventConfig, tracker: ReactTracker = useTracker()) =>
  useOnUnmount(() => {
    tracker.trackEvent(event);
  });
