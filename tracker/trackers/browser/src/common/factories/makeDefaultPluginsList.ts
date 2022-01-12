/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { PathContextFromURLPlugin } from '@objectiv/plugin-path-context-from-url';
import { RootLocationContextFromURLPlugin } from '@objectiv/plugin-root-location-context-from-url';
import { makeTrackerDefaultPluginsList, TrackerPluginInterface } from '@objectiv/tracker-core';
import { BrowserTrackerConfig } from '../../definitions/BrowserTrackerConfig';

/**
 * The default list of Plugins of Browser Tracker
 */
export const makeDefaultPluginsList = (trackerConfig: BrowserTrackerConfig) => {
  const { trackPathContextFromURL = true, trackRootLocationContextFromURL = true } = trackerConfig;

  const plugins: TrackerPluginInterface[] = [...makeTrackerDefaultPluginsList(trackerConfig)];

  if (trackPathContextFromURL) {
    plugins.push(new PathContextFromURLPlugin(trackerConfig));
  }

  if (trackRootLocationContextFromURL) {
    plugins.push(new RootLocationContextFromURLPlugin(trackerConfig));
  }

  return plugins;
};
