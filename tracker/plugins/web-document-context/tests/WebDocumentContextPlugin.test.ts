import { WebDocumentContextPlugin } from '../src';
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
});
