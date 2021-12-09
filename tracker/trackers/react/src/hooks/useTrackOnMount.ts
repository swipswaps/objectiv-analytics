/*
 * Copyright 2021 Objectiv B.V.
 */

import { TrackerEventConfig } from '@objectiv/tracker-core';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './consumers/useTracker';
import { useOnMount } from './useOnMount';

//FIXME add useLocationStack

/**
 * A side effect that triggers the given TrackerEvent on mount.
 */
export const useTrackOnMount = (event: TrackerEventConfig, tracker: ReactTracker = useTracker()) =>
  useOnMount(() => {
    tracker.trackEvent(event);
  });
