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
    const testTrackerEventMemoryQueue = new MemoryQueue<TrackerEvent>();
    spyOn(testTrackerEventMemoryQueue, 'enqueue');
    const testTransport = new FetchAPITransport({
      endpoint: MOCK_ENDPOINT,
      queue: testTrackerEventMemoryQueue,
    });
    await testTransport.handle(testEvent);
    expect(fetch).not.toHaveBeenCalledWith();
    expect(testTrackerEventMemoryQueue.enqueue).toHaveBeenCalledWith(testEvent);
  });
});
