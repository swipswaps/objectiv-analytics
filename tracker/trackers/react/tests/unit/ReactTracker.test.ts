import { TrackerEvent, TrackerPlugins } from '@objectiv/tracker-core';
import { WebTracker } from '@objectiv/tracker-web';
import fetchMock from 'jest-fetch-mock';
import { clear, mockUserAgent } from 'jest-useragent-mock';
import { ReactTracker } from '../../src';

describe('ReactTracker', () => {
  describe('Default Plugins from WebTracker', () => {
    it('should have some Web Plugins configured by default when no `plugins` have been specified', () => {
      const testTracker = new ReactTracker({ applicationId: 'app-id', endpoint: 'localhost' });

      expect(testTracker).toBeInstanceOf(ReactTracker);
      expect(testTracker.plugins?.list).toEqual(
        expect.arrayContaining([
          // TODO adjust to the new plugins
          expect.objectContaining({ pluginName: 'ApplicationContextPlugin' }),
          expect.objectContaining({ pluginName: 'WebDocumentContextPlugin' }),
          expect.objectContaining({ pluginName: 'WebDeviceContextPlugin' }),
        ])
      );
    });

    it('should not have any default Plugin configured when `plugins` have been overridden', () => {
      const testTracker = new WebTracker({
        applicationId: 'app-id',
        endpoint: 'localhost',
        plugins: new TrackerPlugins([]),
      });

      expect(testTracker).toBeInstanceOf(WebTracker);
      expect(testTracker.plugins?.list).toStrictEqual([]);
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

    it('should track Application, WebDocumentContext and DeviceContext Contexts automatically by default', async () => {
      const testTracker = new ReactTracker({ applicationId: 'app-id', endpoint: 'localhost' });
      const testEvent = new TrackerEvent({ _type: 'test-event' });

      expect(testTracker).toBeInstanceOf(ReactTracker);
      expect(testEvent.global_contexts).toHaveLength(0);

      const trackedEvent = await testTracker.trackEvent(testEvent);

      expect(trackedEvent.location_stack).toHaveLength(1);
      expect(trackedEvent.location_stack).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _type: 'WebDocumentContext',
            id: '#document',
            url: 'http://localhost/',
          }),
        ])
      );
      expect(trackedEvent.global_contexts).toHaveLength(2);
      expect(trackedEvent.global_contexts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _type: 'ApplicationContext',
            id: 'app-id',
          }),
          expect.objectContaining({
            _type: 'DeviceContext',
            id: 'device',
            user_agent: USER_AGENT_MOCK_VALUE,
          }),
        ])
      );
    });
  });
});
