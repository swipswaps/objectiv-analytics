/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import {
  ContextsConfig,
  makePathContext,
  TrackerConsole,
  TrackerPluginConfig,
  TrackerPluginInterface,
} from '@objectiv/tracker-core';

/**
 * The PathContextFromURL Plugin gathers the current URL using the Location API.
 * It implements the `enrich` lifecycle method. This ensures the URL is retrieved before each Event is sent.
 */
export class PathContextFromURLPlugin implements TrackerPluginInterface {
  readonly console?: TrackerConsole;
  readonly pluginName = `PathContextFromURLPlugin`;

  /**
   * The constructor is merely responsible for processing the given TrackerPluginConfiguration `console` parameter.
   */
  constructor(config?: TrackerPluginConfig) {
    this.console = config?.console;

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
   * Make this plugin usable only on web, eg: Document and Location APIs are both available
   */
  isUsable(): boolean {
    return typeof document !== 'undefined' && typeof document.location !== 'undefined';
  }
}
