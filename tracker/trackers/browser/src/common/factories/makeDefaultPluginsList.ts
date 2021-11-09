/*
 * Copyright 2021 Objectiv B.V.
 */

import { WebDocumentContextPlugin } from '@objectiv-analytics/plugin-web-document-context';
import { makeTrackerDefaultPluginsList } from '@objectiv-analytics/tracker-core';
import { BrowserTrackerConfig } from '../../definitions/BrowserTrackerConfig';

/**
 * The default list of Plugins of Browser Tracker
 */
export const makeDefaultPluginsList = (trackerConfig: BrowserTrackerConfig) => [
  ...makeTrackerDefaultPluginsList(trackerConfig),
  new WebDocumentContextPlugin({ console: trackerConfig.console }),
];
