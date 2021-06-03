import { trackURLChangedEvent, URL_CHANGE_EVENT_NAME, URLChangedEvent } from '../src';
import { Tracker } from '@objectiv/tracker-core';

describe('URLChangedEvent', () => {
  it('should trigger on all History API methods', () => {
    // Create a test tracker and spy on its `trackEvent` method
    const testTracker = new Tracker();
    spyOn(testTracker, 'trackEvent');

    // Start tracking `popstate` events
    trackURLChangedEvent(testTracker);

    // Make sure our current history is clean (always has an initial entry, thus we start from 1)
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
