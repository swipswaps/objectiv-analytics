/*
 * Copyright 2022 Objectiv B.V.
 */

import { isDevMode } from '../helpers';
import { TrackerInterface } from '../Tracker';
import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { TrackerPluginInterface } from '../TrackerPluginInterface';
import { TrackerValidationRuleInterface } from '../TrackerValidationRuleInterface';

/**
 * Validates a number of rules related to the Open Taxonomy:
 * - ApplicationContext must be present once in Global Contexts.
 * - RootLocationContext must be present once, in position 0, of the Location Stack.
 */
export class OpenTaxonomyValidationPlugin implements TrackerPluginInterface {
  readonly pluginName = `OpenTaxonomyValidationPlugin`;
  validationRules: TrackerValidationRuleInterface[] = [];
  initialized = false;

  /**
   * At initialization, we retrieve TrackerPlatform and initialize all Validation Rules.
   */
  initialize({ platform }: TrackerInterface) {
    try {
      const {
        GlobalContextName,
        GlobalContextValidationRule,
        LocationContextName,
        LocationContextValidationRule,
      } = require('@objectiv/developer-tools');
      this.validationRules = [
        new GlobalContextValidationRule({
          platform,
          logPrefix: this.pluginName,
          contextName: GlobalContextName.ApplicationContext,
          once: true,
        }),
        new LocationContextValidationRule({
          platform,
          logPrefix: this.pluginName,
          contextName: LocationContextName.RootLocationContext,
          once: true,
          position: 0,
        }),
      ];
    } catch {
      TrackerConsole.debug(`%c｢objectiv:${this.pluginName}｣ Validation disabled.`, 'font-weight: bold');
    }
    this.initialized = true;

    TrackerConsole.log(`%c｢objectiv:${this.pluginName}｣ Initialized`, 'font-weight: bold');
  }

  /**
   * Performs Open Taxonomy related validation checks
   */
  validate(event: TrackerEvent): void {
    if (!this.initialized) {
      TrackerConsole.error(`｢objectiv:${this.pluginName}｣ Cannot validate. Make sure to initialize the plugin first.`);
      return;
    }

    if (this.isUsable()) {
      this.validationRules.forEach((validationRule) => validationRule.validate(event));
    }
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
