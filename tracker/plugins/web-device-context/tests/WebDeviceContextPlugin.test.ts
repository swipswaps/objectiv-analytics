import { WebDeviceContextPlugin } from '../src';
import { Tracker, TrackerEvent, TrackerPlugins } from '@objectiv/core';
import { clear, mockUserAgent } from 'jest-useragent-mock';

const USER_AGENT_MOCK_VALUE = 'Mocked User Agent';

describe('WebDeviceContextPlugin', () => {
  beforeEach(() => {
    mockUserAgent(USER_AGENT_MOCK_VALUE);
  });

  afterEach(() => {
    clear();
  });

  it('should generate the WebDeviceContext when constructed', () => {
    const testWebDeviceContextPlugin = new WebDeviceContextPlugin();
    expect(testWebDeviceContextPlugin.webDeviceContext).toEqual({
      _context_type: 'WebDeviceContext',
      id: 'device',
      'user-agent': USER_AGENT_MOCK_VALUE,
    });
  });

  it('should add the WebDeviceContext to the Event when `beforeTransport` is executed by the Tracker', () => {
    const testTracker = new Tracker({ plugins: new TrackerPlugins([WebDeviceContextPlugin]) });
    const eventContexts = {
      globalContexts: [
        { _context_type: 'section', id: 'X' },
        { _context_type: 'section', id: 'Y' },
      ],
    };
    const testEvent = new TrackerEvent({ eventName: 'test-event', ...eventContexts });
    expect(testEvent.globalContexts).toHaveLength(2);
    const trackedEvent = testTracker.trackEvent(testEvent);
    expect(trackedEvent.globalContexts).toHaveLength(3);
    expect(trackedEvent.globalContexts).toEqual(
      expect.arrayContaining([
        {
          _context_type: 'WebDeviceContext',
          id: 'device',
          'user-agent': USER_AGENT_MOCK_VALUE,
        },
      ])
    );
  });
});
