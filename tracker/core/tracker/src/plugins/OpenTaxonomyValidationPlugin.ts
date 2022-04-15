/*
 * Copyright 2022 Objectiv B.V.
 */

import { GlobalContextName, LocationContextName } from '../ContextNames';
import { isDevMode } from '../helpers';
import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { TrackerPluginInterface } from '../TrackerPluginInterface';
import { TrackerValidationRuleInterface } from '../TrackerValidationRuleInterface';
import { GlobalContextValidationRule } from '../validationRules/GlobalContextValidationRule';
import { LocationContextValidationRule } from '../validationRules/LocationContextValidationRule';

/**
 * Validates a number of rules related to the Open Taxonomy:
 * - ApplicationContext must be present once in Global Contexts.
 * - RootLocationContext must be present once, in position 0, of the Location Stack.
 */
export class OpenTaxonomyValidationPlugin implements TrackerPluginInterface {
  readonly pluginName = `OpenTaxonomyValidationPlugin`;
  readonly validationRules: TrackerValidationRuleInterface[];

  /**
   * Initializes console and all Validation Rules.
   */
  constructor() {
    this.validationRules = [
      new GlobalContextValidationRule({
        logPrefix: this.pluginName,
        contextName: GlobalContextName.ApplicationContext,
        once: true,
      }),
      new LocationContextValidationRule({
        logPrefix: this.pluginName,
        contextName: LocationContextName.RootLocationContext,
        once: true,
        position: 0,
      }),
    ];

    TrackerConsole.log(`%c｢objectiv:${this.pluginName}｣ Initialized`, 'font-weight: bold');
  }

  /**
   * Performs Open Taxonomy related validation checks
   */
  validate(event: TrackerEvent): void {
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
