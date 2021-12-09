/*
 * Copyright 2021 Objectiv B.V.
 */

import { TrackerEventConfig } from '@objectiv/tracker-core';
import { ReactTracker } from '../ReactTracker';
import { useTracker } from './consumers/useTracker';
import { useOnToggle } from './useOnToggle';

//FIXME add useLocationStack

/**
 * A variant of the trackOnChange side effect that monitors a boolean `state` and runs the given `trueEvent` or
 * `falseEvent` depending on the state value.
 **/
export const useTrackOnToggle = (
  state: boolean,
  trueEvent: TrackerEventConfig,
  falseEvent: TrackerEventConfig,
  tracker: ReactTracker = useTracker()
) =>
  useOnToggle(
    state,
    () => tracker.trackEvent(trueEvent),
    () => tracker.trackEvent(falseEvent)
  );
