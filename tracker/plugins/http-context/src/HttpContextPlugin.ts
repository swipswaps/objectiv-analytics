/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import {
  ContextsConfig,
  GlobalContextValidationRule,
  makeHttpContext,
  TrackerConsole,
  TrackerEvent,
  TrackerPluginConfig,
  TrackerPluginInterface,
  TrackerValidationRuleInterface,
} from '@objectiv/tracker-core';

/**
 * The HttpContext Plugin gathers the current URL using the Location API.
 * It implements the `initialize` lifecycle method. This ensures the Context is generated when the tracker is created.
 */
export class HttpContextPlugin implements TrackerPluginInterface {
  readonly console?: TrackerConsole;
  readonly pluginName = `HttpContextPlugin`;
  readonly validationRules: TrackerValidationRuleInterface[];

  /**
   * The constructor is responsible for processing the given TrackerPluginConfiguration `console` parameter.
   */
  constructor(config?: TrackerPluginConfig) {
    this.console = config?.console;
    this.validationRules = [
      new GlobalContextValidationRule({
        console: this.console,
        logPrefix: this.pluginName,
        contextName: 'HttpContext',
        once: true,
      }),
    ];

    if (this.console) {
      this.console.log(`%c｢objectiv:${this.pluginName}｣ Initialized`, 'font-weight: bold');
    }
  }

  /**
   * Generate an HttpContext.
   */
  initialize(contexts: Required<ContextsConfig>): void {
    const httpContext = makeHttpContext({
      id: 'http_context',
      referrer: document.referrer ?? '',
      user_agent: navigator.userAgent ?? '',
      remote_address: '127.0.0.1',
    });
    contexts.global_contexts.push(httpContext);
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
   * Make this plugin usable only on web, eg: Document and Navigation APIs are both available
   */
  isUsable(): boolean {
    return typeof document !== 'undefined' && typeof navigator !== 'undefined';
  }
}
