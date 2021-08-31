import { WebTracker, WebTrackerConfig } from '@objectiv/tracker-web';
import { startObservingDOM } from './observer';
import { trackApplicationLoadedEvent } from "./tracker";

/**
 * HTML Tracker automatically track ApplicationLoaded and URLChange Events.
 * This behavior is configurable by overriding the default values via the configuration.
 */
export type HTMLTrackerConfig = WebTrackerConfig & {
  trackApplicationLoaded?: boolean;
  trackURLChanges?: boolean;
};

/**
 * Allows to configure the main tracker instance and initializes the mutation observer to start auto tracking.
 * Tracks Application Loaded Event
 */
export const configureTracker = (htmlTrackerConfig: HTMLTrackerConfig) => {
  const { trackApplicationLoaded = true, trackURLChanges = true, ...webTrackerConfig } = htmlTrackerConfig;

  window.objectiv.tracker = new WebTracker(webTrackerConfig);
  startObservingDOM(window.objectiv.tracker, trackURLChanges);

  if (trackApplicationLoaded) {
    trackApplicationLoadedEvent();
  }
};
