/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { isDevMode } from './helpers';
import { TrackerConsole } from './TrackerConsole';
// import { TrackerEvent } from './TrackerEvent';
import { TrackerPluginConfig, TrackerPluginInterface } from './TrackerPluginInterface';

/**
 * Validates a number of rules related to the Open Taxonomy
 */
export class OpenTaxonomyValidationPlugin implements TrackerPluginInterface {
  readonly console?: TrackerConsole;
  readonly pluginName = `OpenTaxonomyValidationPlugin`;

  /**
   * Generates a ApplicationContext from the given config applicationId.
   */
  constructor(config: TrackerPluginConfig) {
    this.console = config.console;

    if (this.console) {
      this.console.log(`%c｢objectiv:${this.pluginName}｣ Initialized`, 'font-weight: bold');
    }
  }

  /**
   * Performs Open Taxonomy related validation checks
   */
  validate(/*event: TrackerEvent*/): void {
    // TODO error: `requiresContext` check for every context in LocationStack or GlobalContext
    // TODO warning: navigationContext missing around LinkContext
    // TODO warning: LocationContext missing around PressableContext
  }

  /**
   * Make this plugin active only in dev mode.
   */
  isUsable(): boolean {
    return isDevMode();
  }
}
