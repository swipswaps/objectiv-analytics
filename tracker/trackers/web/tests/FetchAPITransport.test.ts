import fetchMock from 'jest-fetch-mock';
import { defaultFetchParameters, FetchAPITransport } from '../src';
import { MemoryQueue, TrackerEvent } from '@objectiv/core';

beforeAll(() => {
  fetchMock.enableMocks();
});

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('FetchAPITransport', () => {
  const MOCK_ENDPOINT = '/test-endpoint';

  const testEvent = new TrackerEvent({
    eventName: 'test-event',
  });

  it('should send using `fetch` API with the default parameters', async () => {
    const testTransport = new FetchAPITransport({
      endpoint: MOCK_ENDPOINT,
    });
    await testTransport.handle(testEvent);
    expect(fetch).toHaveBeenCalledWith(
      MOCK_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify([testEvent]),
        ...defaultFetchParameters,
      })
    );
  });

  it('should send using `fetch` API with the provided custom fetch parameters', async () => {
    const customFetchParameters: RequestInit = {
      ...defaultFetchParameters,
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const testTransport = new FetchAPITransport({
      endpoint: MOCK_ENDPOINT,
      fetchParameters: customFetchParameters,
    });
    await testTransport.handle(testEvent);
    expect(fetch).toHaveBeenCalledWith(
      MOCK_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify([testEvent]),
        ...customFetchParameters,
      })
    );
  });

  it('should enqueue the event in the provided Queue instance', async () => {
    jest.useFakeTimers();

    // Create a test queue
    const testTrackerEventMemoryQueue = new MemoryQueue<TrackerEvent>();

    // Create our Fetch Transport Instance, configured with the test Queue
    const testTransport = new FetchAPITransport({
      endpoint: MOCK_ENDPOINT,
      queue: testTrackerEventMemoryQueue,
    });

    // Let's handle an Event
    await testTransport.handle(testEvent);

    // Since we configured a Queue, the transport should not have called Fetch yet
    expect(fetch).not.toHaveBeenCalled();

    // Instead, it should have enqueued the TrackerEvent
    expect(testTrackerEventMemoryQueue.items).toContain(testEvent);

    // Run timers to the next Queue tick.
    jest.runTimersToTime(testTrackerEventMemoryQueue.batchDelayMs);

    // Await for all promises to be fulfilled
    await new Promise(setImmediate);

    // The Queue should have now sent the event by calling the runFunction once
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      MOCK_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify([testEvent]),
        ...defaultFetchParameters,
      })
    );
  });
});
