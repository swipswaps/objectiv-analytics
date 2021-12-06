/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeURLChangeEvent } from '@objectiv/tracker-core';
import { ReactTracker, trackURLChangeEvent } from '../src';

describe('trackURLChange', () => {
  it('should track a URLChangeEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackURLChangeEvent({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeURLChangeEvent()));
  });
});
