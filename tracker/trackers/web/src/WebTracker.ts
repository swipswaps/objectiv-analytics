import { WebDeviceContextPlugin } from '@objectiv/plugin-web-device-context';
import { WebDocumentContextPlugin } from '@objectiv/plugin-web-document-context';
import {
  ContextsConfig,
  getDefaultTrackerPluginsList,
  QueuedTransport,
  RetryTransport,
  Tracker,
  TrackerConfig,
  TrackerPlugins,
  TrackerQueue,
  TrackerTransport,
  TransportGroup,
  TransportSwitch,
} from '@objectiv/tracker-core';
import { DebugTransport } from './DebugTransport';
import { FetchAPITransport } from './FetchAPITransport';
import { XMLHttpRequestTransport } from './XMLHttpRequestTransport';

/**
 * Web Tracker can be configured in a easier way by specifying just an `endpoint`.
 * Internally it will automatically configure the Transport layer for the given `endpoint` with sensible defaults.
 */
export type WebTrackerConfig = TrackerConfig & {
  endpoint?: string;
};

/**
 * A factory to create the default Transport of Web Tracker. Requires an endpoint as its only parameter.
 */
export const makeWebTrackerDefaultTransport = (config: { endpoint: string }): TrackerTransport =>
  new TransportGroup(
    new QueuedTransport({
      queue: new TrackerQueue(),
      transport: new RetryTransport({
        transport: new TransportSwitch(
          new FetchAPITransport({ endpoint: config.endpoint }),
          new XMLHttpRequestTransport({ endpoint: config.endpoint })
        ),
      }),
    }),
    new DebugTransport()
  );

/**
 * The default list of Plugins of Web Tracker
 */
export const getDefaultWebTrackerPluginsList = (config: WebTrackerConfig) => [
  ...getDefaultTrackerPluginsList(config),
  WebDocumentContextPlugin,
  WebDeviceContextPlugin,
];

/**
 * Web Tracker is a 1:1 instance of Tracker with a simplified construction and some preconfigured Plugins.
 * It initializes with a Queued Fetch and XMLHttpRequest Transport Switch wrapped in a Retry Transport automatically.
 * The resulting Queue has some sensible defaults (10 events every 100ms) for sending events in batches.
 * The Retry logic is configured for 10 retries with exponential backoff starting at 1000ms.
 * The transport is also grouped with a DebugTransport for logging the handled events to console.
 *
 * This construction:
 *
 *  const webTracker = new WebTracker({ applicationId: 'app-id', endpoint: '/endpoint' });
 *
 * is equivalent to:
 *
 *  const fetchTransport = new FetchAPITransport({ endpoint: '/endpoint' });
 *  const xmlHttpRequestTransport = new XMLHttpRequestTransport({ endpoint: '/endpoint' });
 *  const transportSwitch = new TransportSwitch(fetchTransport, xmlHttpRequestTransport);
 *  const retryTransport = new RetryTransport({ transport: transportSwitch});
 *  const debugTransport = new DebugTransport();
 *  const transportGroup = new TransportGroup(retryTransport, debugTransport);
 *  const trackerQueue = new TrackerQueue();
 *  const transport = new QueuedTransport({ transport: transportGroup, queue: trackerQueue });
 *  const applicationContextPlugin = new ApplicationContextPlugin({ applicationId: 'app-id' });
 *  const plugins = new TrackerPlugins([ applicationContextPlugin, WebDocumentContextPlugin, WebDeviceContextPlugin ]);
 *  const tracker = new Tracker({ transport, plugins });
 *
 */
export class WebTracker extends Tracker {
  constructor(webConfig: WebTrackerConfig, ...contextConfigs: ContextsConfig[]) {
    let config = webConfig;

    // Either `transport` or `endpoint` must be provided
    if (!config.transport && !config.endpoint) {
      throw new Error('Either `transport` or `endpoint` must be provided');
    }

    // `transport` and `endpoint` must not be provided together
    if (config.transport && config.endpoint) {
      throw new Error('Please provider either `transport` or `endpoint`, not both at same time');
    }

    // Automatically create a default Transport for the given `endpoint` with a sensible setup
    if (config.endpoint) {
      config = {
        ...config,
        transport: makeWebTrackerDefaultTransport({ endpoint: config.endpoint }),
      };
    }

    // Configure to use provided `plugins` or automatically create a Plugins instance with some sensible web defaults
    if (!config.plugins) {
      config = {
        ...config,
        plugins: new TrackerPlugins(getDefaultWebTrackerPluginsList(config)),
      };
    }

    super(config, ...contextConfigs);
  }
}
