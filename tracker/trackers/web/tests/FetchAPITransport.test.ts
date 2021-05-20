import fetchMock from 'jest-fetch-mock';
import { FetchAPITransport } from '../src';
import { TrackerEvent } from '@objectiv/core';

beforeAll(() => {
  fetchMock.enableMocks();
});

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('FetchAPITransport', () => {
  const MOCK_ENDPOINT = '/test-endpoint';

  const testTransport = new FetchAPITransport({
    endpoint: MOCK_ENDPOINT,
  });
  const testEvent = new TrackerEvent({
    eventName: 'test-event',
  });

  it('should send using `fetch` API', async () => {
    await testTransport.handle(testEvent);
    expect(fetch).toHaveBeenCalledWith(
      MOCK_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify([testEvent]),
      })
    );
  });
});
