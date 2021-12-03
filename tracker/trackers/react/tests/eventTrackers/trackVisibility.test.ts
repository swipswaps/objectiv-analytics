/*
 * Copyright 2021 Objectiv B.V.
 */

import { makeSectionHiddenEvent, makeSectionVisibleEvent } from "@objectiv/tracker-core";
import { ReactTracker, trackVisibility } from "../../src";

describe('trackVisibility', () => {
  it('should track a SectionHiddenEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackVisibility({ tracker, isVisible: false });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeSectionHiddenEvent()));
  });

  it('should track a SectionVisibleEvent', () => {
    const tracker = new ReactTracker({ applicationId: 'app-id' });
    jest.spyOn(tracker, 'trackEvent');

    trackVisibility({ tracker, isVisible: true });

    expect(tracker.trackEvent).toHaveBeenCalledTimes(1);
    expect(tracker.trackEvent).toHaveBeenNthCalledWith(1, expect.objectContaining(makeSectionVisibleEvent()));
  });
});
