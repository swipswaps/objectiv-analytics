import { TrackerEvent } from '@objectiv/core';
import { ReactTracker } from '../src';
import fetchMock from 'jest-fetch-mock';
import { clear, mockUserAgent } from 'jest-useragent-mock';

describe('ReactTracker', () => {
  describe('Default Plugins from WebTracker', () => {
    it('should have some Web Plugins configured by default when no `plugins` have been specified', () => {
      const testTracker = new ReactTracker({ endpoint: 'localhost' });
      expect(testTracker).toBeInstanceOf(ReactTracker);
      expect(testTracker.plugins?.list).toEqual(
        expect.arrayContaining([
          // TODO adjust to the new plugins
          expect.objectContaining({ pluginName: 'WebDocumentContextPlugin' }),
          expect.objectContaining({ pluginName: 'WebDeviceContextPlugin' }),
        ])
      );
    });
  });

  describe('trackEvent', () => {
    const USER_AGENT_MOCK_VALUE = 'Mocked User Agent';

    beforeEach(() => {
      fetchMock.enableMocks();
      mockUserAgent(USER_AGENT_MOCK_VALUE);
    });

    afterEach(() => {
      fetchMock.resetMocks();
      clear();
    });

    it('should track XXX and YYY Contexts automatically by default', () => {
      const testTracker = new ReactTracker({ endpoint: 'localhost' });
      const testEvent = new TrackerEvent({ eventName: 'test-event' });
      expect(testTracker).toBeInstanceOf(ReactTracker);
      expect(testEvent.globalContexts).toHaveLength(0);
      const trackedEvent = testTracker.trackEvent(testEvent);

      // TODO adjust to the new plugins
      expect(trackedEvent.globalContexts).toHaveLength(2);
      expect(trackedEvent.globalContexts).toEqual(
        expect.arrayContaining([
          {
            _context_type: 'WebDocumentContext',
            id: '#document',
            url: 'http://localhost/',
          },
          {
            _context_type: 'WebDeviceContext',
            id: 'device',
            'user-agent': USER_AGENT_MOCK_VALUE,
          },
        ])
      );
    });
  });
});
