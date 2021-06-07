import { makeWebDocumentContext, Tracker } from '@objectiv/tracker-core';
import { trackWebDocumentLoadedEvent } from '../src/WebDocumentLoadedEvent';

describe('WebDocumentLoadedEvent', () => {
  it('should throw if the Tracker does not have a WebDocumentContext in their Location Stack', () => {
    const testTracker = new Tracker();
    expect(() => trackWebDocumentLoadedEvent(testTracker)).toThrow(
      'DocumentLoaded Events require Trackers with WebDocumentContext in their Location Stack'
    );
  });

  it('should track as expected', () => {
    const testTracker = new Tracker({
      locationStack: [
        makeWebDocumentContext({
          id: '#document',
          url: '/test',
        }),
      ],
    });

    spyOn(testTracker, 'trackEvent');

    trackWebDocumentLoadedEvent(testTracker);

    expect(testTracker.trackEvent).toHaveBeenCalledWith({
      _interactive_event: false,
      event: 'DocumentLoadedEvent',
      globalContexts: [],
      locationStack: [
        {
          _location_context: true,
          _section_context: true,
          _context_type: 'WebDocumentContext',
          id: '#document',
          url: '/test',
        },
      ],
    });
  });
});
