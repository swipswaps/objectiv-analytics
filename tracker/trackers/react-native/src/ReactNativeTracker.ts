/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { ContextsConfig, isBrowser, isDevMode, Tracker, TrackerConfig } from '@objectiv/tracker-core';
import { makeReactNativeTrackerDefaultPluginsList } from './common/factories/makeReactNativeTrackerDefaultPluginsList';
import { makeReactNativeTrackerDefaultQueue } from './common/factories/makeReactNativeTrackerDefaultQueue';
import { makeReactNativeTrackerDefaultTransport } from './common/factories/makeReactNativeTrackerDefaultTransport';

/**
 * React Native Tracker can be configured in an easier way, as opposed to the core tracker.
 * The minimum required parameters are the `applicationId` and either an `endpoint` or a `transport` object.
 */
export type ReactNativeTrackerConfig = TrackerConfig & {
  /**
   * The collector endpoint URL.
   */
  endpoint?: string;

  /**
   * Optional. Whether to automatically create HttpContext based on Document and Navigation APIs. Enabled by default.
   */
  trackHttpContext?: boolean;

  /**
   * Optional. Whether to automatically create PathContext based on URLs. Enabled by default.
   */
  trackPathContextFromURL?: boolean;

  /**
   * Optional. Whether to automatically create RootLocationContext based on URLs first slugs. Enabled by default.
   */
  trackRootLocationContextFromURL?: boolean;
};

/**
 * React Native Tracker simplifies Tracker construction and adds some preconfigured Transport, Queue and Plugins.
 * It initializes with a Queued Fetch|XMLHttpRequest Transport Switch wrapped in a Retry Transport.
 *
 * The resulting Queue has some sensible defaults (10 events every 100ms) for sending events in batches.
 * The Retry logic is configured for 10 retries with exponential backoff starting at 1000ms.
 *
 * This statement:
 *
 *  const tracker = new ReactTracker({ applicationId: 'app-id', endpoint: '/endpoint', console: console });
 *
 * is equivalent to:
 *
 *  const trackerId = trackerConfig.trackerId ?? trackerConfig.applicationId;
 *  const console = trackerConfig.console;
 *  const fetchTransport = new FetchAPITransport({ endpoint: '/endpoint', console });
 *  const transport = new RetryTransport({ transport: transportSwitch, console });
 *  const queueStorage = new TrackerQueueMemoryStorage({ trackerId, console })
 *  const trackerQueue = new TrackerQueue({ storage: queueStorage, console });
 *  const applicationContextPlugin = new ApplicationContextPlugin({ applicationId: 'app-id', console });
 *  // TODO replace with React Native implementation
 *  const httpContextPlugin = new HttpContextPlugin({ console });
 *  const pathContextFromURLPlugin = new PathContextFromURLPlugin({ console });
 *  const rootLocationContextFromURLPlugin = new RootLocationContextFromURLPlugin({ console });
 *  const plugins = [
 *    applicationContextPlugin,
 *    httpContextPlugin,
 *    pathContextFromURLPlugin,
 *    rootLocationContextFromURLPlugin
 *  ];
 *  const tracker = new Tracker({ transport, queue, plugins, console });
 *
 *  @see makeReactNativeTrackerDefaultTransport
 *  @see makeReactNativeTrackerDefaultQueue
 *  @see makeReactNativeTrackerDefaultPluginsList
 */
export class ReactNativeTracker extends Tracker {
  constructor(trackerConfig: ReactNativeTrackerConfig, ...contextConfigs: ContextsConfig[]) {
    let config = trackerConfig;

    // Either `transport` or `endpoint` must be provided
    if (!config.transport && !config.endpoint) {
      throw new Error('Either `transport` or `endpoint` must be provided');
    }

    // `transport` and `endpoint` must not be provided together
    if (config.transport && config.endpoint) {
      throw new Error('Please provider either `transport` or `endpoint`, not both at same time');
    }

    // If node is in `development` on web and console has not been configured, automatically use the browser's console
    if (config.console === undefined && isDevMode() && isBrowser()) {
      config.console = console;
    }

    // Automatically create a default Transport for the given `endpoint` with a sensible setup
    if (config.endpoint) {
      config = {
        ...config,
        transport: makeReactNativeTrackerDefaultTransport(config),
        queue: config.queue ?? makeReactNativeTrackerDefaultQueue(config),
      };
    }

    // Configure to use provided `plugins` or automatically create a Plugins instance with some sensible web defaults
    if (!config.plugins) {
      config = {
        ...config,
        plugins: makeReactNativeTrackerDefaultPluginsList(config),
      };
    }

    // Initialize Core Tracker
    super(config, ...contextConfigs);
  }
}
