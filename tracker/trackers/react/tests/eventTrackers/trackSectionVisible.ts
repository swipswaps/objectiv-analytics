/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeSectionVisibleEvent } from "@objectiv/tracker-core";
import { ReactTracker, trackSectionVisible } from "../../src";

describe('trackSectionVisible', () => {
  it('should track a SectionVisibleEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackSectionVisible({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeSectionVisibleEvent()));
  });
});
