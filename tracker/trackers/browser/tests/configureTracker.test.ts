import { BrowserTracker, configureTracker } from '../src/';

describe('configureTracker', () => {
  it('should create a new Browser Tracker in window.object.tracker and start auto tracking', () => {
    configureTracker({ applicationId: 'app-id', endpoint: 'localhost' });
    const testTracker = window.objectiv.tracker;
    expect(testTracker).toBeInstanceOf(BrowserTracker);
  });
});
