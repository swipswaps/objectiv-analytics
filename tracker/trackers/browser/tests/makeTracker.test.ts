import { BrowserTracker, getTracker, makeTracker } from '../src/';

describe('makeTracker', () => {
  it('should create a new Browser Tracker in window.object.tracker and start auto tracking', () => {
    expect(window.objectiv.trackers.trackersMap.size).toBe(0);
    makeTracker({ applicationId: 'app-id', endpoint: 'localhost' });
    expect(getTracker()).toBeInstanceOf(BrowserTracker);
  });

  // TODO finish testing TrackerRepository thoroughly
});
