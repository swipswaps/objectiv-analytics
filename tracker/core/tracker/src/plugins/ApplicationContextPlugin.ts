/*
 * Copyright 2022 Objectiv B.V.
 */

import { ApplicationContext } from '@objectiv/schema';
import { ContextsConfig } from '../Context';
import { makeApplicationContext } from '../ContextFactories';
import { TrackerConfig } from '../Tracker';
import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { TrackerPluginInterface } from '../TrackerPluginInterface';
import { TrackerValidationRuleInterface } from '../TrackerValidationRuleInterface';
import { GlobalContextValidationRule } from '../validationRules/GlobalContextValidationRule';

/**
 * The ApplicationContextPlugin Config object.
 */
export type ApplicationContextPluginConfig = Pick<TrackerConfig, 'applicationId'>;

/**
 * The ApplicationContextPlugin adds an ApplicationContext as GlobalContext before events are transported.
 *
 * Event Validation:
 *  - Must be present in Global Contexts
 *  - Must not be present multiple times
 */
export class ApplicationContextPlugin implements TrackerPluginInterface {
  readonly pluginName = `ApplicationContextPlugin`;
  readonly applicationContext: ApplicationContext;
  readonly validationRules: TrackerValidationRuleInterface[];

  /**
   * Generates a ApplicationContext from the given config applicationId.
   */
  constructor(config: ApplicationContextPluginConfig) {
    this.applicationContext = makeApplicationContext({
      id: config.applicationId,
    });
    this.validationRules = [
      new GlobalContextValidationRule({
        logPrefix: this.pluginName,
        contextName: 'ApplicationContext',
        once: true,
      }),
    ];

    TrackerConsole.groupCollapsed(`｢objectiv:${this.pluginName}｣ Initialized`);
    TrackerConsole.log(`Application ID: ${config.applicationId}`);
    TrackerConsole.group(`Application Context:`);
    TrackerConsole.log(this.applicationContext);
    TrackerConsole.groupEnd();
    TrackerConsole.groupEnd();
  }

  /**
   * Add the ApplicationContext to the Event's Global Contexts
   */
  enrich(contexts: Required<ContextsConfig>): void {
    contexts.global_contexts.push(this.applicationContext);
  }

  /**
   * If the Plugin is usable runs all validation rules.
   */
  validate(event: TrackerEvent): void {
    if (this.isUsable()) {
      this.validationRules.forEach((validationRule) => validationRule.validate(event));
    }
  }

  /**
   * Make this plugin always usable
   */
  isUsable(): boolean {
    return true;
  }
}
