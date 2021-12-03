/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeApplicationLoadedEvent } from "@objectiv/tracker-core";
import { ReactTracker, trackApplicationLoaded } from "../../src";

describe('trackApplicationLoaded', () => {
  it('should track an ApplicationLoadedEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackApplicationLoaded({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeApplicationLoadedEvent()));
  });
});
