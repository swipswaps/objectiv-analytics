import { TrackerTransportInterface, TrackerTransportRetry, TrackerTransportSwitch } from '@objectiv/tracker-core';
import { BrowserTrackerConfig } from '../../definitions/BrowserTrackerConfig';
import { FetchAPITransport } from '../../transport/FetchAPITransport';
import { XMLHttpRequestTransport } from '../../transport/XMLHttpRequestTransport';

/**
 * A factory to create the default Transport of Browser Tracker.
 */
export const makeBrowserTrackerDefaultTransport = (trackerConfig: BrowserTrackerConfig): TrackerTransportInterface =>
  new TrackerTransportRetry({
    console: trackerConfig.console,
    transport: new TrackerTransportSwitch({
      console: trackerConfig.console,
      transports: [
        new FetchAPITransport({ endpoint: trackerConfig.endpoint, console: trackerConfig.console }),
        new XMLHttpRequestTransport({ endpoint: trackerConfig.endpoint, console: trackerConfig.console }),
      ],
    }),
  });
