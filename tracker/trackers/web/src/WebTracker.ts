import { Tracker, TrackerConfig, TrackerPlugins } from '@objectiv/core';
import { FetchAPITransport } from './FetchAPITransport';
import { WebDocumentContextPlugin } from '@objectiv/plugin-web-document-context';
import { WebDeviceContextPlugin } from '@objectiv/plugin-web-device-context';

/**
 * Web Tracker can be configured in a easier way by specifying just an `endpoint`.
 * Internally it will automatically construct a FetchAPITransport for the given `endpoint`.
 */
export type WebTrackerConfig = TrackerConfig & {
  endpoint?: string;
};

/**
 * Web Tracker is a 1:1 instance of Tracker with a simplified construction and some preconfigured Plugins.
 *
 * TODO Implement helper method for easy Section Tracking
 *
 * This construction:
 *
 *  const webTracker = new WebTracker({ endpoint: '/endpoint' })
 *
 * is equivalent to:
 *
 *  const plugins = TrackerPlugins([ WebDocumentContextPlugin, WebDeviceContextPlugin ]);
 *  const transport = new FetchAPITransport({ endpoint: '/endpoint' });
 *  const tracker = new WebTracker({ transport, plugins });
 *
 */
export class WebTracker extends Tracker {
  constructor(webConfig: WebTrackerConfig) {
    let config = webConfig;

    // Either `transport` or `endpoint` must be provided
    if (!config.transport && !config.endpoint) {
      throw new Error('Either `transport` or `endpoint` must be provided');
    }

    // `transport` and `endpoint` must not be provided together
    if (config.transport && config.endpoint) {
      throw new Error('Please provider either `transport` or `endpoint`, not both at same time');
    }

    // Automatically create a FetchAPITransport with the given `endpoint`
    if (config.endpoint) {
      config = { ...config, transport: new FetchAPITransport({ endpoint: config.endpoint }) };
    }

    // Configure to use provided `plugins` or automatically create a Plugins instance with some sensible web defaults
    if (!config.plugins) {
      config = {
        ...config,
        plugins: new TrackerPlugins([WebDocumentContextPlugin, WebDeviceContextPlugin]),
      };
    }

    super(config);
  }
}
