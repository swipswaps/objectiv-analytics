/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeSectionHiddenEvent } from "@objectiv/tracker-core";
import { ReactTracker, trackSectionHidden } from "../../src";

describe('trackSectionHidden', () => {
  it('should track a SectionHiddenEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackSectionHidden({ tracker });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeSectionHiddenEvent()));
  });
});
