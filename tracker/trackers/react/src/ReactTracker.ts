import { Tracker, TrackerPlugins } from '@objectiv/core';
import { defaultWebTrackerPluginsList, WebTrackerConfig } from '@objectiv/tracker-web';

export type ReactTrackerConfig = WebTrackerConfig;

export class ReactTracker extends Tracker {
  constructor(reactConfig: ReactTrackerConfig) {
    let config = reactConfig;

    // Extend generic Web Plugins from Web Tracker with React specific ones
    if (!config.plugins) {
      config = {
        ...config,
        plugins: new TrackerPlugins([
          ...defaultWebTrackerPluginsList,
          // TODO add React plugins
        ]),
      };
    }

    console.log(config);

    super(config);
  }
}
