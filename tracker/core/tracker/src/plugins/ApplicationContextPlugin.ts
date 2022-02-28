/*
 * Copyright 2022 Objectiv B.V.
 */

import { ApplicationContext } from '@objectiv/schema';
import { ContextsConfig, ContextType } from '../Context';
import { makeApplicationContext } from '../ContextFactories';
import { TrackerConfig } from '../Tracker';
import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { TrackerPluginConfig, TrackerPluginInterface } from '../TrackerPluginInterface';
import { TrackerValidationRuleInterface } from '../TrackerValidationRuleInterface';
import { ContextValidationRuleConfig } from '../validationRules/ContextValidationRuleConfig';
import { RequiresContextValidationRule } from '../validationRules/RequiresContextValidationRule';
import { UniqueContextValidationRule } from '../validationRules/UniqueContextValidationRule';

/**
 * The ApplicationContextPlugin Config object.
 */
export type ApplicationContextPluginConfig = TrackerPluginConfig & Pick<TrackerConfig, 'applicationId'>;

/**
 * The ApplicationContextPlugin adds an ApplicationContext as GlobalContext before events are transported.
 *
 * Event Validation:
 *  - Must be present in Global Contexts
 *  - Must not be present multiple times
 */
export class ApplicationContextPlugin implements TrackerPluginInterface {
  readonly console?: TrackerConsole;
  readonly pluginName = `ApplicationContextPlugin`;
  readonly applicationContext: ApplicationContext;
  readonly validationRules: TrackerValidationRuleInterface[];

  /**
   * Generates a ApplicationContext from the given config applicationId.
   */
  constructor(config: ApplicationContextPluginConfig) {
    this.console = config.console;
    this.applicationContext = makeApplicationContext({
      id: config.applicationId,
    });
    const validationRuleConfig: ContextValidationRuleConfig = {
      console: this.console,
      contextName: 'ApplicationContext',
      contextType: ContextType.GlobalContexts,
    };
    this.validationRules = [
      new RequiresContextValidationRule(validationRuleConfig),
      new UniqueContextValidationRule(validationRuleConfig),
    ];

    if (this.console) {
      this.console.groupCollapsed(`｢objectiv:${this.pluginName}｣ Initialized`);
      this.console.log(`Application ID: ${config.applicationId}`);
      this.console.group(`Application Context:`);
      this.console.log(this.applicationContext);
      this.console.groupEnd();
      this.console.groupEnd();
    }
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
