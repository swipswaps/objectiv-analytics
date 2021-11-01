import { WebDeviceContextPlugin } from '@objectiv/plugin-web-device-context';
import { WebDocumentContextPlugin } from '@objectiv/plugin-web-document-context';
import { makeTrackerDefaultPluginsList } from '@objectiv/tracker-core';
import { BrowserTrackerConfig } from '../definitions/BrowserTrackerConfig';

/**
 * The default list of Plugins of Browser Tracker
 */
export const makeDefaultBrowserTrackerPluginsList = (trackerConfig: BrowserTrackerConfig) => [
  ...makeTrackerDefaultPluginsList(trackerConfig),
  new WebDocumentContextPlugin({ console: trackerConfig.console }),
  new WebDeviceContextPlugin({ console: trackerConfig.console }),
];
