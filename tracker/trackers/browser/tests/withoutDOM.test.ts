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

  it('should throw if a Tracker instance cannot be retrieved and was not provided either', async () => {
    // @ts-ignore
    expect(() => trackEvent({ eventFactory: makeClickEvent, element: null })).toThrow(
      'Tracker not initialized. Please provide a tracker instance.'
    );
  });
});
