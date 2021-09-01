import { TransportGroup } from '@objectiv/tracker-core';
import { BrowserTracker, configureTracker, defaultFetchFunction } from '../src/';

describe('configureTracker', () => {
  it('should create a new Browser Tracker in window.object.tracker', () => {
    configureTracker({ applicationId: 'app-id', endpoint: 'localhost' });
    const testTracker = window.objectiv.tracker;
    expect(testTracker).toBeInstanceOf(BrowserTracker);
    expect(testTracker.transport).toBeInstanceOf(TransportGroup);
    expect(testTracker.transport).toEqual({
      transportName: 'TransportGroup',
      usableTransports: [
        {
          transportName: 'QueuedTransport',
          queue: {
            queueName: 'TrackerQueue',
            batchDelayMs: 1000,
            batchSize: 10,
            concurrency: 4,
            processFunction: expect.any(Function),
            processingEventIds: [],
            store: {
              queueStoreName: 'TrackerQueueMemoryStore',
              length: 0,
              events: [],
            },
          },
          transport: {
            transportName: 'RetryTransport',
            maxAttempts: 10,
            maxRetryMs: Infinity,
            maxTimeoutMs: Infinity,
            minTimeoutMs: 1000,
            retryFactor: 2,
            attempts: [],
            transport: {
              transportName: 'TransportSwitch',
              firstUsableTransport: {
                transportName: 'FetchAPITransport',
                endpoint: 'localhost',
                fetchFunction: defaultFetchFunction,
              },
            },
          },
        },
        {
          transportName: 'DebugTransport',
        },
      ],
    });
  });
});
