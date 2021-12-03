/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeCompletedEvent } from "@objectiv/tracker-core";
import { ReactTracker, trackCompleted } from "../../src";

describe('trackCompleted', () => {
  it('should track a CompletedEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackCompleted({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeCompletedEvent()));
  });
});
