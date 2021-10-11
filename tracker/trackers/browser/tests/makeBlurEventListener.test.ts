import { makeInputChangeEvent } from '@objectiv/tracker-core';
import { BrowserTracker, getTracker, makeTracker } from '../src/';
import { makeBlurEventListener } from '../src/observer/makeBlurEventListener';
import { makeTaggedElement } from './mocks/makeTaggedElement';

describe('makeBlurEventListener', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    makeTracker({ applicationId: 'test', endpoint: 'test' });
    expect(getTracker()).toBeInstanceOf(BrowserTracker);
    jest.spyOn(getTracker(), 'trackEvent');
  });

  it('should track Input Change when invoked from a valid target', () => {
    const trackedInput = makeTaggedElement('input', null, 'input');
    const blurEventListener = makeBlurEventListener(trackedInput);

    trackedInput.addEventListener('blur', blurEventListener);
    trackedInput.dispatchEvent(new FocusEvent('blur'));

    expect(getTracker().trackEvent).toHaveBeenCalledTimes(1);
    expect(getTracker().trackEvent).toHaveBeenNthCalledWith(1, makeInputChangeEvent());
  });

  it('should not track Input Change when invoked from a bubbling target', () => {
    const trackedInput = makeTaggedElement('input1', null, 'input');
    const unrelatedInput = makeTaggedElement('input2', null, 'input');
    const blurEventListener = makeBlurEventListener(trackedInput);

    trackedInput.addEventListener('blur', blurEventListener);
    unrelatedInput.dispatchEvent(new FocusEvent('blur'));

    expect(getTracker().trackEvent).not.toHaveBeenCalled();
  });
});
