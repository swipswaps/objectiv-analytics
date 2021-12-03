/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeVideoPauseEvent } from "@objectiv/tracker-core";
import { ReactTracker, trackVideoPause } from "../../src";

describe('trackVideoPause', () => {
  it('should track a VideoPauseEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackVideoPause({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeVideoPauseEvent()));
  });
});
