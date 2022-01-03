/*
 * Copyright 2022 Objectiv B.V.
 */

import { PathContextFromURLPlugin } from '@objectiv/plugin-path-context-from-url';
import { makeTrackerDefaultPluginsList } from '@objectiv/tracker-core';
import { ReactTrackerConfig } from '../../ReactTracker';

/**
 * The default list of Plugins of React Tracker
 */
export const makeDefaultPluginsList = (trackerConfig: ReactTrackerConfig) => [
  ...makeTrackerDefaultPluginsList(trackerConfig),
  new PathContextFromURLPlugin(trackerConfig),
];
