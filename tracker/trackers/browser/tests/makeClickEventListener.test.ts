import { makeClickEvent } from '@objectiv/tracker-core';
import { BrowserTracker, configureTracker } from '../src/';
import { makeClickEventListener } from '../src/observer/makeClickEventListener';
import { makeTaggedElement } from './mocks/makeTaggedElement';

describe('makeClickEventListener', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    configureTracker({ applicationId: 'test', endpoint: 'test' });
    expect(window.objectiv.trackers.get()).toBeInstanceOf(BrowserTracker);
    jest.spyOn(window.objectiv.trackers.get(), 'trackEvent');
  });

  it('should track Button Click when invoked from a valid target', () => {
    const trackedButton = makeTaggedElement('button', null, 'button');
    const clickEventListener = makeClickEventListener(trackedButton, window.objectiv.trackers.get());

    trackedButton.addEventListener('click', clickEventListener);
    trackedButton.dispatchEvent(new MouseEvent('click'));

    expect(window.objectiv.trackers.get().trackEvent).toHaveBeenCalledTimes(1);
    expect(window.objectiv.trackers.get().trackEvent).toHaveBeenNthCalledWith(1, makeClickEvent());
  });

  it('should not track Div Click when invoked from a bubbling target', () => {
    const trackedButton = makeTaggedElement('button', null, 'button');
    const trackedDiv = makeTaggedElement('div', null, 'div');
    const divClickEventListener = jest.fn(makeClickEventListener(trackedDiv, window.objectiv.trackers.get()));

    trackedDiv.addEventListener('click', divClickEventListener);
    trackedButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(divClickEventListener).not.toHaveBeenCalled();
    expect(window.objectiv.trackers.get().trackEvent).not.toHaveBeenCalled();
  });
});
