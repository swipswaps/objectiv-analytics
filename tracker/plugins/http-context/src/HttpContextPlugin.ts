/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { GlobalContextName, GlobalContextValidationRule } from "@objectiv/developer-tools";
import {
  makeHttpContext,
  TrackerConsole,
  TrackerEvent,
  TrackerInterface,
  TrackerPluginInterface,
  TrackerValidationRuleInterface,
} from '@objectiv/tracker-core';

/**
 * The HttpContext Plugin gathers the current URL using the Location API.
 * It implements the `initialize` lifecycle method. This ensures the Context is generated when the tracker is created.
 */
export class HttpContextPlugin implements TrackerPluginInterface {
  readonly pluginName = `HttpContextPlugin`;
  validationRules: TrackerValidationRuleInterface[] = [];

  /**
   * Generates an HttpContext and initializes validation rules.
   */
  initialize(tracker: TrackerInterface): void {
    this.validationRules = [
      new GlobalContextValidationRule({
        platform: tracker.platform,
        logPrefix: this.pluginName,
        contextName: GlobalContextName.HttpContext,
        once: true,
      }),
    ];

    const httpContext = makeHttpContext({
      id: 'http_context',
      referrer: document.referrer ?? '',
      user_agent: navigator.userAgent ?? '',
    });

    tracker.global_contexts.push(httpContext);

    TrackerConsole.log(`%c｢objectiv:${this.pluginName}｣ Initialized`, 'font-weight: bold');
  }

  /**
   * If the Plugin is usable runs all validation rules.
   */
  validate(event: TrackerEvent): void {
    if (this.isUsable()) {
      if (!this.validationRules.length) {
        TrackerConsole.error(
          `｢objectiv:${this.pluginName}｣ Cannot validate. Make sure to initialize the plugin first.`
        );
        return;
      }
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
