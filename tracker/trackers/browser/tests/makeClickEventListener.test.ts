import { makeButtonContext, makeClickEvent } from '@objectiv/tracker-core';
import { BrowserTracker, getTracker, makeTracker } from '../src/';
import { makeClickEventHandler } from '../src/observer/makeClickEventHandler';
import { makeTaggedElement } from './mocks/makeTaggedElement';

describe('makeClickEventHandler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    makeTracker({ applicationId: 'test', endpoint: 'test' });
    expect(getTracker()).toBeInstanceOf(BrowserTracker);
    jest.spyOn(getTracker(), 'trackEvent');
  });

  it('should track Button Click when invoked from a valid target', () => {
    const trackedButton = makeTaggedElement('button', null, 'button');
    const clickEventListener = makeClickEventHandler(trackedButton, getTracker());

    trackedButton.addEventListener('click', clickEventListener);
    trackedButton.dispatchEvent(new MouseEvent('click'));

    expect(getTracker().trackEvent).toHaveBeenCalledTimes(1);
    expect(getTracker().trackEvent).toHaveBeenNthCalledWith(1, makeClickEvent());
  });

  it('should not track Div Click when invoked from a bubbling target', () => {
    const trackedButton = makeTaggedElement('button', null, 'button');
    const trackedDiv = makeTaggedElement('div', null, 'div');
    const divClickEventListener = jest.fn(makeClickEventHandler(trackedDiv, getTracker()));

    trackedDiv.addEventListener('click', divClickEventListener);
    trackedButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(divClickEventListener).not.toHaveBeenCalled();
    expect(getTracker().trackEvent).not.toHaveBeenCalled();
  });

  it('should not track Div Click when current target is not a click-tracking tagged element', () => {
    const span = document.createElement('span');
    const trackedButton = makeTaggedElement('button', 'button', 'button', false);
    trackedButton.appendChild(span);
    const buttonClickEventListener = jest.fn(makeClickEventHandler(trackedButton, getTracker()));

    trackedButton.addEventListener('click', buttonClickEventListener);
    span.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(buttonClickEventListener).toHaveBeenCalled();
    expect(getTracker().trackEvent).not.toHaveBeenCalled();
  });

  it('should track Div Click when invoked from a non-tagged child', () => {
    const span = document.createElement('span');
    const trackedButton = makeTaggedElement('button', 'button', 'button', true);
    trackedButton.appendChild(span);
    const buttonClickEventListener = jest.fn(makeClickEventHandler(trackedButton, getTracker()));

    trackedButton.addEventListener('click', buttonClickEventListener);
    span.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(buttonClickEventListener).toHaveBeenCalled();
    expect(getTracker().trackEvent).toHaveBeenCalledTimes(1);
    expect(getTracker().trackEvent).toHaveBeenNthCalledWith(
      1,
      makeClickEvent({ location_stack: [makeButtonContext({ id: 'button', text: 'button' })] })
    );
  });
});
