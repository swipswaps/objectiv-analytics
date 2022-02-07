/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import {
  ContextsConfig,
  makeHttpContext,
  TrackerConsole,
  TrackerPluginConfig,
  TrackerPluginInterface,
} from '@objectiv/tracker-core';

/**
 * The HttpContext Plugin gathers the current URL using the Location API.
 * It implements the `initialize` lifecycle method. This ensures the Context is generated when the tracker is created.
 */
export class HttpContextPlugin implements TrackerPluginInterface {
  readonly console?: TrackerConsole;
  readonly pluginName = `HttpContextPlugin`;

  /**
   * The constructor is responsible for processing the given TrackerPluginConfiguration `console` parameter.
   */
  constructor(config?: TrackerPluginConfig) {
    this.console = config?.console;

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
      referer: document.referrer,
      user_agent: navigator.userAgent,
      remote_address: '127.0.0.1',
    });
    contexts.global_contexts.push(httpContext);
  }

  /**
   * Make this plugin usable only on web, eg: Document and Navigation APIs are both available
   */
  isUsable(): boolean {
    return typeof document !== 'undefined' && typeof navigator !== 'undefined';
  }
}
