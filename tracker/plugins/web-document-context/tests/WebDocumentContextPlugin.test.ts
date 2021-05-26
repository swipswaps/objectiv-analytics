import {URL_CHANGE_EVENT_NAME, URLChangedEvent, WebDocumentContextPlugin} from '../src';
import { Tracker, TrackerEvent, TrackerPlugins } from '@objectiv/core';

describe('WebDocumentContextPlugin', () => {
  it('should instantiate without specifying an ID at construction', () => {
    const testWebDocumentContextPlugin = new WebDocumentContextPlugin();
    expect(testWebDocumentContextPlugin.documentContextId).toBe(document.nodeName);
  });

  it('should instantiate with a custom ID at construction', () => {
    const customDocumentId = 'CustomId';
    const testWebDocumentContextPlugin = new WebDocumentContextPlugin({ documentContextId: customDocumentId });
    expect(testWebDocumentContextPlugin.documentContextId).toBe(customDocumentId);
  });

  it('should add the WebDocumentContext to the Event when `beforeTransport` is executed by the Tracker', () => {
    const testTracker = new Tracker({ plugins: new TrackerPlugins([WebDocumentContextPlugin]) });
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
          _context_type: 'WebDocumentContext',
          id: '#document',
          url: 'http://localhost/',
        },
      ])
    );
  });

  it('should automatically trigger URLChangedEvents in response to the History API', () => {
    const testTracker = new Tracker({ plugins: new TrackerPlugins([WebDocumentContextPlugin]) });
    spyOn(testTracker, 'trackEvent');

    expect(window.history).toHaveLength(1);

    window.history.pushState({ page: 1 }, 'title 1', '?page=1');
    expect(window.history).toHaveLength(2);
    expect(testTracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(testTracker.trackEvent).toHaveBeenCalledWith(new URLChangedEvent({ eventName: URL_CHANGE_EVENT_NAME }));

    window.history.pushState({ page: 2 }, 'title 2', '?page=2');
    expect(window.history).toHaveLength(3);
    expect(testTracker.trackEvent).toHaveBeenCalledTimes(2);
    expect(testTracker.trackEvent).toHaveBeenCalledWith(new URLChangedEvent({ eventName: URL_CHANGE_EVENT_NAME }));

    window.history.replaceState({ page: 3 }, 'title 3', '?page=3');
    expect(window.history).toHaveLength(3);
    expect(testTracker.trackEvent).toHaveBeenCalledTimes(3);
    expect(testTracker.trackEvent).toHaveBeenCalledWith(new URLChangedEvent({ eventName: URL_CHANGE_EVENT_NAME }));

    window.history.replaceState({ page: 1 }, 'title1', '?page=1');
    expect(window.history).toHaveLength(3);
    expect(testTracker.trackEvent).toHaveBeenCalledTimes(4);
    expect(testTracker.trackEvent).toHaveBeenCalledWith(new URLChangedEvent({ eventName: URL_CHANGE_EVENT_NAME }));

    window.history.go(1);
    expect(window.history).toHaveLength(3);
    expect(testTracker.trackEvent).toHaveBeenCalledTimes(5);
    expect(testTracker.trackEvent).toHaveBeenCalledWith(new URLChangedEvent({ eventName: URL_CHANGE_EVENT_NAME }));

    window.history.back();
    expect(window.history).toHaveLength(3);
    expect(testTracker.trackEvent).toHaveBeenCalledTimes(6);
    expect(testTracker.trackEvent).toHaveBeenCalledWith(new URLChangedEvent({ eventName: URL_CHANGE_EVENT_NAME }));

    window.history.forward();
    expect(window.history).toHaveLength(3);
    expect(testTracker.trackEvent).toHaveBeenCalledTimes(7);
    expect(testTracker.trackEvent).toHaveBeenCalledWith(new URLChangedEvent({ eventName: URL_CHANGE_EVENT_NAME }));

  });
});
