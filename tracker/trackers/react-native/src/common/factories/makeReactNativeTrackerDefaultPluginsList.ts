/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeCoreTrackerDefaultPluginsList } from '@objectiv/tracker-core';
import { ReactNativeTrackerConfig } from '../../ReactNativeTracker';

/**
 * The default list of Plugins of React Native Tracker
 */
export const makeReactNativeTrackerDefaultPluginsList = (trackerConfig: ReactNativeTrackerConfig) => {
  // TODO implement native plugins

  return makeCoreTrackerDefaultPluginsList(trackerConfig);
};
