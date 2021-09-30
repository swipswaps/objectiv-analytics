import { makeClickEvent } from '@objectiv/tracker-core';
import { BrowserTracker, getTracker, makeTracker } from '../src/';
import { makeClickEventListener } from '../src/observer/makeClickEventListener';
import { makeTaggedElement } from './mocks/makeTaggedElement';

describe('makeClickEventListener', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    makeTracker({ applicationId: 'test', endpoint: 'test' });
    expect(getTracker()).toBeInstanceOf(BrowserTracker);
    jest.spyOn(getTracker(), 'trackEvent');
  });

  it('should track Button Click when invoked from a valid target', () => {
    const trackedButton = makeTaggedElement('button', null, 'button');
    const clickEventListener = makeClickEventListener(trackedButton, getTracker());

    trackedButton.addEventListener('click', clickEventListener);
    trackedButton.dispatchEvent(new MouseEvent('click'));

    expect(getTracker().trackEvent).toHaveBeenCalledTimes(1);
    expect(getTracker().trackEvent).toHaveBeenNthCalledWith(1, makeClickEvent());
  });

  it('should not track Div Click when invoked from a bubbling target', () => {
    const trackedButton = makeTaggedElement('button', null, 'button');
    const trackedDiv = makeTaggedElement('div', null, 'div');
    const divClickEventListener = jest.fn(makeClickEventListener(trackedDiv, getTracker()));

    trackedDiv.addEventListener('click', divClickEventListener);
    trackedButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(divClickEventListener).not.toHaveBeenCalled();
    expect(getTracker().trackEvent).not.toHaveBeenCalled();
  });
});
