import { makeMutationCallback } from '../observer/makeMutationCallback';
import { TaggingAttribute } from '../TaggingAttribute';
import { BrowserTrackerConfig } from '../tracker/BrowserTracker';
import { trackApplicationLoaded } from '../tracker/trackEventHelpers';
import { trackerErrorHandler } from '../trackerErrorHandler';
import { AutoTrackingState } from './AutoTrackingState';
import { getTracker } from './getTracker';

/**
 * The options that `startAutoTracking` accepts
 */
export type AutoTrackingOptions = Pick<BrowserTrackerConfig, 'trackURLChanges' | 'trackApplicationLoaded' | 'console'>;

/**
 * Initializes our automatic tracking, based on Mutation Observer.
 * Also tracks application Loaded.
 * Safe to call multiple times: it will auto-track only once.
 */
export const startAutoTracking = (options?: AutoTrackingOptions) => {
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