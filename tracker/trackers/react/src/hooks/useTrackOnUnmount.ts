/*
 * Copyright 2021 Objectiv B.V.
 */

import { TrackerEventConfig } from '@objectiv/tracker-core';
import { TrackConditionalHookParameters } from '@objectiv/tracker-react';
import { useTracker } from './consumers/useTracker';
import { useOnUnmount } from './useOnUnmount';

/**
 * The parameters of useTrackOnUnmount
 */
export type TrackOnUnmountHookParameters = TrackConditionalHookParameters & {
  /**
   * The Event to track
   */
  event: TrackerEventConfig;
};

/**
 * A side effect that triggers the given TrackerEvent on unmount.
 */
export const useTrackOnUnmount = (parameters: TrackOnUnmountHookParameters) => {
  const { event, tracker = useTracker() } = parameters;

  return useOnUnmount(() => {
    tracker.trackEvent(event);
  });
};
