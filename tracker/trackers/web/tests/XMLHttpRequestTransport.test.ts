import { TrackerEvent } from '@objectiv/core';
import { XMLHttpRequestTransport } from '../src';
import xhrMock from 'xhr-mock';

beforeEach(() => {
  xhrMock.setup();
});

afterEach(() => {
  xhrMock.teardown();
});

describe('XMLHttpRequestTransport', () => {
  const MOCK_ENDPOINT = '/test-endpoint';

  const testEvent = new TrackerEvent({
    eventName: 'test-event',
  });

  it('should send using `xhr` with the default xhr function', async () => {
    const testTransport = new XMLHttpRequestTransport({
      endpoint: MOCK_ENDPOINT,
    });

    xhrMock.post(MOCK_ENDPOINT, (req, res) => {
      expect(req.header('Content-Type')).toEqual('text/plain');
      expect(req.body()).toEqual(JSON.stringify([testEvent]));
      return res.status(200);
    });

    await testTransport.handle(testEvent);
  });
});
