import { BrowserTracker, configureTracker, ElementTrackingAttribute } from "../src";
import { makeSectionVisibleEvent } from "@objectiv/tracker-core";
import trackVisibilityVisibleEvent from "../src/observer/trackVisibilityVisibleEvent";
import makeTrackedElement from "./mocks/makeTrackedElement";

describe('trackVisibilityVisibleEvent', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    configureTracker({ applicationId: 'test', endpoint: 'test' });
    expect(window.objectiv.tracker).toBeInstanceOf(BrowserTracker);
    spyOn(window.objectiv.tracker, 'trackEvent');
  });

  it('should not track elements without visibility tracking attributes', async () => {
    const trackedDiv = makeTrackedElement('div-id', 'null', 'div');

    trackVisibilityVisibleEvent(trackedDiv)

    expect(window.objectiv.tracker.trackEvent).not.toHaveBeenCalled()
  });

  it('should not track elements with invalid visibility tracking attributes', async () => {
    const trackedDiv = makeTrackedElement('div-id', 'null', 'div');
    trackedDiv.setAttribute(ElementTrackingAttribute.trackVisibility, 'null')

    trackVisibilityVisibleEvent(trackedDiv)

    expect(window.objectiv.tracker.trackEvent).not.toHaveBeenCalled()
  });

  it('should track in mode:auto', async () => {
    const trackedDiv = makeTrackedElement('div-id', 'null', 'div');
    trackedDiv.setAttribute(ElementTrackingAttribute.trackVisibility, '{"mode":"auto"}')

    trackVisibilityVisibleEvent(trackedDiv)

    expect(window.objectiv.tracker.trackEvent).toHaveBeenCalledTimes(1)
    expect(window.objectiv.tracker.trackEvent).toHaveBeenNthCalledWith(1, makeSectionVisibleEvent())
  });

  it('should track in mode:manual with isVisible:true', async () => {
    const trackedDiv = makeTrackedElement('div-id', 'null', 'div');
    trackedDiv.setAttribute(ElementTrackingAttribute.trackVisibility, '{"mode":"manual","isVisible":true}')

    trackVisibilityVisibleEvent(trackedDiv)

    expect(window.objectiv.tracker.trackEvent).toHaveBeenCalledTimes(1)
    expect(window.objectiv.tracker.trackEvent).toHaveBeenNthCalledWith(1, makeSectionVisibleEvent())
  });

  it('should not track in mode:manual with isVisible:false', async () => {
    const trackedDiv = makeTrackedElement('div-id', 'null', 'div');
    trackedDiv.setAttribute(ElementTrackingAttribute.trackVisibility, '{"mode":"manual","isVisible":false}')

    trackVisibilityVisibleEvent(trackedDiv)

    expect(window.objectiv.tracker.trackEvent).not.toHaveBeenCalled()
  });
});
