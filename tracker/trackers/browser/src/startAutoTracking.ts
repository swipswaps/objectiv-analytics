/*
 * Copyright 2021 Objectiv B.V.
 */

import { trackerErrorHandler } from './common/trackerErrorHandler';
import { BrowserTrackerConfig } from './definitions/BrowserTrackerConfig';
import { TaggingAttribute } from './definitions/TaggingAttribute';
import { trackApplicationLoaded } from './eventTrackers/trackApplicationLoaded';
import { getTracker } from './getTracker';
import { AutoTrackingState } from './mutationObserver/AutoTrackingState';
import { makeMutationCallback } from './mutationObserver/makeMutationCallback';

/**
 * Initializes our automatic tracking, based on Mutation Observer.
 * Also tracks application Loaded.
 * Safe to call multiple times: it will auto-track only once.
 */
export const startAutoTracking = (
  options?: Pick<BrowserTrackerConfig, 'trackURLChanges' | 'trackApplicationLoaded' | 'console'>
) => {
  try {
    // Nothing to do if we are already auto-tracking
    if (AutoTrackingState.observerInstance) {
      return;
    }

    // Create Mutation Observer Callback
    const mutationCallback = makeMutationCallback(options?.trackURLChanges ?? true, options?.console);

    // Create Mutation Observer
    AutoTrackingState.observerInstance = new MutationObserver(mutationCallback);

    // Start observing DOM
    AutoTrackingState.observerInstance.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: [TaggingAttribute.trackVisibility, TaggingAttribute.elementId],
    });

    // Track ApplicationLoaded Event - once
    if ((options?.trackApplicationLoaded ?? true) && !AutoTrackingState.applicationLoaded) {
      AutoTrackingState.applicationLoaded = true;
      trackApplicationLoaded({ tracker: getTracker() });
    }
  } catch (error) {
    trackerErrorHandler(error);
  }
};
