/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { HttpContextPlugin } from '@objectiv/plugin-http-context';
import { PathContextFromURLPlugin } from '@objectiv/plugin-path-context-from-url';
import { RootLocationContextFromURLPlugin } from '@objectiv/plugin-root-location-context-from-url';
import { makeTrackerDefaultPluginsList, TrackerPluginInterface } from '@objectiv/tracker-core';
import { ReactTrackerConfig } from '../../ReactTracker';

/**
 * The default list of Plugins of React Tracker
 */
export const makeDefaultPluginsList = (trackerConfig: ReactTrackerConfig) => {
  const { trackPathContextFromURL = true, trackRootLocationContextFromURL = true } = trackerConfig;

  const plugins: TrackerPluginInterface[] = [
    ...makeTrackerDefaultPluginsList(trackerConfig),
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
