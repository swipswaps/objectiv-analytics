/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { PathContextFromURLPlugin } from '@objectiv/plugin-path-context-from-url';
import { makeTrackerDefaultPluginsList } from '@objectiv/tracker-core';
import { BrowserTrackerConfig } from '../../definitions/BrowserTrackerConfig';

/**
 * The default list of Plugins of Browser Tracker
 */
export const makeDefaultPluginsList = (trackerConfig: BrowserTrackerConfig) => [
  ...makeTrackerDefaultPluginsList(trackerConfig),
  new PathContextFromURLPlugin(trackerConfig),
];
