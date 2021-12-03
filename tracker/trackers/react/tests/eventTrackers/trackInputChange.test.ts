/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeInputChangeEvent } from "@objectiv/tracker-core";
import { ReactTracker, trackInputChange } from "../../src";

describe('trackInputChange', () => {
  it('should track an InputChangeEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackInputChange({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeInputChangeEvent()));
  });
});
