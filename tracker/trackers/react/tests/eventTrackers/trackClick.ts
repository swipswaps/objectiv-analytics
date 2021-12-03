/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeClickEvent } from "@objectiv/tracker-core";
import { ReactTracker, trackClick } from "../../src";

describe('trackClick', () => {
  it('should track a ClickEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackClick({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeClickEvent()));
  });
});
