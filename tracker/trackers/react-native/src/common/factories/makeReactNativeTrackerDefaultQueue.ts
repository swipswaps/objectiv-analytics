/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerQueue, TrackerQueueInterface, TrackerQueueMemoryStore } from '@objectiv/tracker-core';
import { ReactNativeTrackerConfig } from '../../ReactNativeTracker';

/**
 * A factory to create the default Queue of React Native Tracker.
 * // TODO consider using Async Storage
 */
export const makeReactNativeTrackerDefaultQueue = (trackerConfig: ReactNativeTrackerConfig): TrackerQueueInterface =>
  new TrackerQueue({
    store: new TrackerQueueMemoryStore({
      console: trackerConfig.console,
    }),
    console: trackerConfig.console,
  });
