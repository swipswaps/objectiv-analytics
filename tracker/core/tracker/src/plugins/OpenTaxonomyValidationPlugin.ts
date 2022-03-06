/*
 * Copyright 2022 Objectiv B.V.
 */

import { isDevMode } from '../helpers';
import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { TrackerPluginConfig, TrackerPluginInterface } from '../TrackerPluginInterface';
import { TrackerValidationRuleInterface } from '../TrackerValidationRuleInterface';
import { GlobalContextValidationRule } from '../validationRules/GlobalContextValidationRule';
import { LocationContextValidationRule } from '../validationRules/LocationContextValidationRule';

/**
 * Validates a number of rules related to the Open Taxonomy.
 */
export class OpenTaxonomyValidationPlugin implements TrackerPluginInterface {
  readonly console?: TrackerConsole;
  readonly pluginName = `OpenTaxonomyValidationPlugin`;
  readonly validationRules: TrackerValidationRuleInterface[];

  /**
   * Initializes console and all Validation Rules.
   */
  constructor(config: TrackerPluginConfig) {
    this.console = config.console;
    this.validationRules = [
      new LocationContextValidationRule({
        console: this.console,
        logPrefix: this.pluginName,
        contextName: 'RootLocationContext',
        once: true,
        position: 0,
      }),
      new GlobalContextValidationRule({
        console: this.console,
        logPrefix: this.pluginName,
        contextName: 'PathContext',
        once: true,
      }),
    ];

    if (this.console) {
      this.console.log(`%c｢objectiv:${this.pluginName}｣ Initialized`, 'font-weight: bold');
    }
  }

  /**
   * Performs Open Taxonomy related validation checks
   */
  validate(event: TrackerEvent): void {
    this.validationRules.forEach((validationRule) => validationRule.validate(event));
  }

  /**
   * Make this plugin active only in dev mode.
   */
  isUsable(): boolean {
    return isDevMode();
  }
}
