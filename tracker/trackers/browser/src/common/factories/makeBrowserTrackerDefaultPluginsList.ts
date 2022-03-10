/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { HttpContextPlugin } from '@objectiv/plugin-http-context';
import { PathContextFromURLPlugin } from '@objectiv/plugin-path-context-from-url';
import { RootLocationContextFromURLPlugin } from '@objectiv/plugin-root-location-context-from-url';
import { makeCoreTrackerDefaultPluginsList, TrackerPluginInterface } from '@objectiv/tracker-core';
import { BrowserTrackerConfig } from '../../definitions/BrowserTrackerConfig';

/**
 * The default list of Plugins of Browser Tracker
 */
export const makeBrowserTrackerDefaultPluginsList = (trackerConfig: BrowserTrackerConfig) => {
  const { trackPathContextFromURL = true, trackRootLocationContextFromURL = true } = trackerConfig;

  const plugins: TrackerPluginInterface[] = [
    ...makeCoreTrackerDefaultPluginsList(trackerConfig),
    new HttpContextPlugin(trackerConfig),
  ];

  if (trackPathContextFromURL) {
    plugins.push(new PathContextFromURLPlugin(trackerConfig));
  }

  if (trackRootLocationContextFromURL) {
    plugins.push(new RootLocationContextFromURLPlugin(trackerConfig));
  }

  return plugins;
};
