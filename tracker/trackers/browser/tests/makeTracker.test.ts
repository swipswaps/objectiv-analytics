import { BrowserTracker, getTracker, makeTracker } from '../src/';

describe('makeTracker', () => {
  afterEach(() => {
    window.objectiv.trackers.trackersMap.clear();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    expect(window.objectiv.trackers.trackersMap.size).toBe(0);
    jest.spyOn(console, 'error');
  });

  it('should create a new Browser Tracker in window.object.tracker and start auto tracking', () => {
    makeTracker({ applicationId: 'app-id', endpoint: 'localhost' });
    expect(window.objectiv.trackers.trackersMap.size).toBe(1);
    expect(getTracker()).toBeInstanceOf(BrowserTracker);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should create three new Browser Trackers and getTracker should work only when specifying a trackerId', () => {
    makeTracker({ applicationId: 'app-id-1', endpoint: 'localhost' });
    makeTracker({ applicationId: 'app-id-2', endpoint: 'localhost' });
    makeTracker({ applicationId: 'app-id-3', endpoint: 'localhost' });
    expect(window.objectiv.trackers.trackersMap.size).toBe(3);
    expect(getTracker()).toBeUndefined();
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      '｢objectiv:TrackerRepository｣ Multiple Tracker Instances. Please provide a `trackerId`.'
    );
    expect(getTracker('app-id-1').applicationId).toBe('app-id-1');
    expect(getTracker('app-id-2').applicationId).toBe('app-id-2');
    expect(getTracker('app-id-3').applicationId).toBe('app-id-3');
  });

  it('should allow creating multiple Browser Trackers for the same application', () => {
    makeTracker({ applicationId: 'app-id', trackerId: 'tracker-1', endpoint: 'localhost' });
    makeTracker({ applicationId: 'app-id', trackerId: 'tracker-2', endpoint: 'localhost' });
    makeTracker({ applicationId: 'app-id', trackerId: 'tracker-3', endpoint: 'localhost' });
    expect(window.objectiv.trackers.trackersMap.size).toBe(3);
    expect(getTracker('app-id-1')).toBeUndefined();
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('｢objectiv:TrackerRepository｣ Tracker `app-id-1` not found.');
    expect(getTracker('tracker-1').applicationId).toBe('app-id');
    expect(getTracker('tracker-2').applicationId).toBe('app-id');
    expect(getTracker('tracker-3').applicationId).toBe('app-id');
  });

  it('should not allow overwriting an existing Browser Trackers instance', () => {
    makeTracker({ applicationId: 'app-id', trackerId: 'tracker-1', endpoint: 'localhost' });
    makeTracker({ applicationId: 'tracker-1', endpoint: 'localhost' });
    expect(window.objectiv.trackers.trackersMap.size).toBe(1);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('｢objectiv:TrackerRepository｣ Tracker `tracker-1` already exists.');
    makeTracker({ applicationId: 'app-id', trackerId: 'tracker-1', endpoint: 'localhost' });
    expect(window.objectiv.trackers.trackersMap.size).toBe(1);
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenNthCalledWith(
      2,
      '｢objectiv:TrackerRepository｣ Tracker `tracker-1` already exists.'
    );
  });
});
