import { GlobalContexts, LocationStack } from '@objectiv/tracker-core';
import { BrowserTracker } from '../BrowserTracker';
import { TaggableElement } from '../definitions/elements';
import { TrackerErrorHandlerCallback } from '../definitions/TrackerErrorHandlerCallback';

/**
 * The parameters of the Event Tracker shorthand functions
 */
export type InteractiveEventTrackerParameters = {
  element: TaggableElement | EventTarget;
  locationStack?: LocationStack;
  globalContexts?: GlobalContexts;
  tracker?: BrowserTracker;
  onError?: TrackerErrorHandlerCallback;
};
