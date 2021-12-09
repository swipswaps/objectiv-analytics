/*
 * Copyright 2021 Objectiv B.V.
 */

import { TrackerEventConfig } from '@objectiv/tracker-core';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './consumers/useTracker';
import { useOnChange } from './useOnChange';

//FIXME add useLocationStack

/**
 * A side effect that monitors the given `state` and triggers the given TrackerEvent when state changes.
 */
export const useTrackOnChange = <T>(state: T, event: TrackerEventConfig, tracker: ReactTracker = useTracker()) =>
  useOnChange<T>(state, () => {
    tracker.trackEvent(event);
  });
