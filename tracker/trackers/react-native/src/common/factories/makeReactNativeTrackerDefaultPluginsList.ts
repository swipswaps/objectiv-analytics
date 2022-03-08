/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { HttpContextPlugin } from '@objectiv/plugin-http-context';
import { PathContextFromURLPlugin } from '@objectiv/plugin-path-context-from-url';
import { RootLocationContextFromURLPlugin } from '@objectiv/plugin-root-location-context-from-url';
import { makeCoreTrackerDefaultPluginsList, TrackerPluginInterface } from '@objectiv/tracker-core';
import { ReactNativeTrackerConfig } from '../../ReactNativeTracker';

/**
 * The default list of Plugins of React Native Tracker
 */
export const makeReactNativeTrackerDefaultPluginsList = (trackerConfig: ReactNativeTrackerConfig) => {
  const {
    trackHttpContext = true,
    trackPathContextFromURL = true,
    trackRootLocationContextFromURL = true,
  } = trackerConfig;

  const plugins: TrackerPluginInterface[] = makeCoreTrackerDefaultPluginsList(trackerConfig);

  if (trackHttpContext) {
    // TODO replace with Native version of this plugin
    plugins.push(new HttpContextPlugin(trackerConfig));
  }

  if (trackPathContextFromURL) {
    // TODO replace with Native version of this plugin
    plugins.push(new PathContextFromURLPlugin(trackerConfig));
  }

  if (trackRootLocationContextFromURL) {
    // TODO replace with Native version of this plugin
    plugins.push(new RootLocationContextFromURLPlugin(trackerConfig));
  }

  return plugins;
};
