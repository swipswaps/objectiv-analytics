/**
 * @jest-environment node
 */
import { makeClickEvent } from '@objectiv/tracker-core';
import { configureTracker, trackEvent } from '../src';

describe('Without DOM', () => {
  it('should throw if Window does not exists', async () => {
    // @ts-ignore
    expect(() => configureTracker({ applicationId: 'test', endpoint: 'test' })).toThrow(
      'Cannot access the Window interface. Tracker cannot be initialized.'
    );
  });

  it('should console.error if a Tracker instance cannot be retrieved because DOM is not available', async () => {
    spyOn(console, 'error');

    const parameters = { eventFactory: makeClickEvent, element: null };
    // @ts-ignore
    trackEvent(parameters);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(1, ReferenceError('window is not defined'), parameters);
  });
});
