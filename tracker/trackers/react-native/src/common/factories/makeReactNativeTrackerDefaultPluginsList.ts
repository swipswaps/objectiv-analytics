/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeCoreTrackerDefaultPluginsList } from '@objectiv/tracker-core';
import { ReactNativeTrackerConfig } from '@objectiv/tracker-react-native';

/**
 * The default list of Plugins of React Native Tracker
 */
export const makeReactNativeTrackerDefaultPluginsList = (trackerConfig: ReactNativeTrackerConfig) => {
  return makeCoreTrackerDefaultPluginsList(trackerConfig);
};
