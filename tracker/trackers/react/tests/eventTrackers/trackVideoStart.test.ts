/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeVideoStartEvent } from '@objectiv/tracker-core';
import { ReactTracker, trackVideoStartEvent } from '../../src';

describe('trackVideoStart', () => {
  it('should track a VideoStartEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackVideoStartEvent({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeVideoStartEvent()));
  });
});
