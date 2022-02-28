/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import {
  ContextsConfig,
  ContextType,
  makePathContext,
  RequiresContextValidationRule,
  TrackerConsole,
  TrackerEvent,
  TrackerPluginConfig,
  TrackerPluginInterface,
  TrackerValidationRuleInterface,
  UniqueContextValidationRule,
} from '@objectiv/tracker-core';
import { ContextValidationRuleConfig } from '@objectiv/tracker-core/src/validationRules/ContextValidationRuleConfig';

/**
 * The PathContextFromURL Plugin gathers the current URL using the Location API.
 * It implements the `enrich` lifecycle method. This ensures the URL is retrieved before each Event is sent.
 *
 * Event Validation:
 *  - Must be present in Global Contexts
 *  - Must not be present multiple times
 */
export class PathContextFromURLPlugin implements TrackerPluginInterface {
  readonly console?: TrackerConsole;
  readonly pluginName = `PathContextFromURLPlugin`;
  readonly validationRules: TrackerValidationRuleInterface[];

  /**
   * The constructor is merely responsible for processing the given TrackerPluginConfiguration `console` parameter.
   */
  constructor(config?: TrackerPluginConfig) {
    this.console = config?.console;
    const validationRuleConfig: ContextValidationRuleConfig = {
      console: this.console,
      contextName: 'PathContext',
      contextType: ContextType.GlobalContexts,
    };
    this.validationRules = [
      new RequiresContextValidationRule(validationRuleConfig),
      new UniqueContextValidationRule(validationRuleConfig),
    ];

    if (this.console) {
      this.console.log(`%c｢objectiv:${this.pluginName}｣ Initialized`, 'font-weight: bold');
    }
  }

  /**
   * Generate a fresh PathContext before each TrackerEvent is handed over to the TrackerTransport.
   */
  enrich(contexts: Required<ContextsConfig>): void {
    const pathContext = makePathContext({
      id: document.location.href,
    });
    contexts.global_contexts.push(pathContext);
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
   * Make this plugin usable only on web, eg: Document and Location APIs are both available
   */
  isUsable(): boolean {
    return typeof document !== 'undefined' && typeof document.location !== 'undefined';
  }
}
