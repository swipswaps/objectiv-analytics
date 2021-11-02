import { TrackedElement } from "@objectiv/tracker-browser";
import { GlobalContexts, LocationStack } from '@objectiv/tracker-core';
import { BrowserTracker } from '../BrowserTracker';
import { TrackerErrorHandlerCallback } from './TrackerErrorHandlerCallback';

/**
 * The parameters of the Event Tracker shorthand functions
 */
export type InteractiveEventTrackerParameters = {
  element: TrackedElement;
  locationStack?: LocationStack;
  globalContexts?: GlobalContexts;
  tracker?: BrowserTracker;
  onError?: TrackerErrorHandlerCallback;
};
