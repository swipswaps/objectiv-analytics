import { BeaconAPITransport } from '../src';
import { TrackerEvent } from '@objectiv/core';

// TODO add actual Karma + Chrome tests to test the real API, instead of the mock below

// JSDOM doesn't support sendBeacon, let's just mock them
navigator.sendBeacon = jest.fn();

describe('BeaconAPITransport', () => {
  const MOCK_ENDPOINT = '/test-endpoint';

  const testEvent = new TrackerEvent({
    eventName: 'test-event',
  });

  it('should send using `sendBeacon` API', async () => {
    const testTransport = new BeaconAPITransport({
      endpoint: MOCK_ENDPOINT,
    });
    await testTransport.handle(testEvent);
    expect(navigator.sendBeacon).toHaveBeenCalledWith(MOCK_ENDPOINT, JSON.stringify([testEvent]));
  });
});
