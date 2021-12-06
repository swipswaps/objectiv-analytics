/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeAbortedEvent } from '@objectiv/tracker-core';
import { ReactTracker, trackAbortedEvent } from '../../src';

describe('trackAborted', () => {
  it('should track an AbortedEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackAbortedEvent({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeAbortedEvent()));
  });
});
