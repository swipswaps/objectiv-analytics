import { makeSectionHiddenEvent } from '@objectiv/tracker-core';
import { BrowserTracker, configureTracker, ElementTrackingAttribute } from '../src';
import trackVisibilityHiddenEvent from '../src/observer/trackVisibilityHiddenEvent';
import makeTrackedElement from './mocks/makeTrackedElement';

describe('trackVisibilityHiddenEvent', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    configureTracker({ applicationId: 'test', endpoint: 'test' });
    expect(window.objectiv.tracker).toBeInstanceOf(BrowserTracker);
    spyOn(window.objectiv.tracker, 'trackEvent');
  });

  it('should not track elements without visibility tracking attributes', async () => {
    const trackedDiv = makeTrackedElement('div-id', 'null', 'div');

    trackVisibilityHiddenEvent(trackedDiv);

    expect(window.objectiv.tracker.trackEvent).not.toHaveBeenCalled();
  });

  it('should not track elements with invalid visibility tracking attributes', async () => {
    const trackedDiv = makeTrackedElement('div-id', 'null', 'div');
    trackedDiv.setAttribute(ElementTrackingAttribute.trackVisibility, 'null');

    trackVisibilityHiddenEvent(trackedDiv);

    expect(window.objectiv.tracker.trackEvent).not.toHaveBeenCalled();
  });

  it('should track in mode:auto', async () => {
    const trackedDiv = makeTrackedElement('div-id', 'null', 'div');
    trackedDiv.setAttribute(ElementTrackingAttribute.trackVisibility, '{"mode":"auto"}');

    trackVisibilityHiddenEvent(trackedDiv);

    expect(window.objectiv.tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(window.objectiv.tracker.trackEvent).toHaveBeenNthCalledWith(1, makeSectionHiddenEvent());
  });

  it('should not track in mode:manual with isVisible:true', async () => {
    const trackedDiv = makeTrackedElement('div-id', 'null', 'div');
    trackedDiv.setAttribute(ElementTrackingAttribute.trackVisibility, '{"mode":"manual","isVisible":true}');

    trackVisibilityHiddenEvent(trackedDiv);

    expect(window.objectiv.tracker.trackEvent).not.toHaveBeenCalled();
  });

  it('should track in mode:manual with isVisible:false', async () => {
    const trackedDiv = makeTrackedElement('div-id', 'null', 'div');
    trackedDiv.setAttribute(ElementTrackingAttribute.trackVisibility, '{"mode":"manual","isVisible":false}');

    trackVisibilityHiddenEvent(trackedDiv);

    expect(window.objectiv.tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(window.objectiv.tracker.trackEvent).toHaveBeenNthCalledWith(1, makeSectionHiddenEvent());
  });
});
