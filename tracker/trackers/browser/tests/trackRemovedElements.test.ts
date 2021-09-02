import { BrowserTracker, configureTracker } from '../src';
import trackNewElement from '../src/observer/trackNewElement';

describe('trackRemovedElements', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    configureTracker({ applicationId: 'test', endpoint: 'test' });
    expect(window.objectiv.tracker).toBeInstanceOf(BrowserTracker);
    spyOn(window.objectiv.tracker, 'trackEvent');
  });

  it('should skip the Element if it is not a Tracked Element', async () => {
    // TODO finish this
    const div = document.createElement('div');
    spyOn(div, 'addEventListener');

    trackNewElement(div);

    expect(div.addEventListener).not.toHaveBeenCalled();
    expect(window.objectiv.tracker.trackEvent).not.toHaveBeenCalled();
  });
});
