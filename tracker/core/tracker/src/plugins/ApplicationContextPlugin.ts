/*
 * Copyright 2022 Objectiv B.V.
 */

import { ApplicationContext } from '@objectiv/schema';
import { ContextsConfig } from '../Context';
import { makeApplicationContext } from '../ContextFactories';
import { TrackerInterface } from '../Tracker';
import { TrackerConsole } from '../TrackerConsole';
import { TrackerPluginInterface } from '../TrackerPluginInterface';

/**
 * The ApplicationContextPlugin adds an ApplicationContext as GlobalContext before events are transported.
 * ApplicationContext Validation is performed by OpenTaxonomyValidationPlugin
 */
export class ApplicationContextPlugin implements TrackerPluginInterface {
  readonly pluginName = `ApplicationContextPlugin`;
  applicationContext?: ApplicationContext;

  /**
   * Generates a ApplicationContext with the Tracker's applicationId.
   */
  initialize(tracker: TrackerInterface) {
    this.applicationContext = makeApplicationContext({
      id: tracker.applicationId,
    });

    TrackerConsole.groupCollapsed(`｢objectiv:${this.pluginName}｣ Initialized`);
    TrackerConsole.log(`Application ID: ${tracker.applicationId}`);
    TrackerConsole.group(`Application Context:`);
    TrackerConsole.log(this.applicationContext);
    TrackerConsole.groupEnd();
    TrackerConsole.groupEnd();
  }

  /**
   * Add the ApplicationContext to the Event's Global Contexts
   */
  enrich(contexts: Required<ContextsConfig>): void {
    if (!this.applicationContext) {
      TrackerConsole.error(`｢objectiv:${this.pluginName}｣ Cannot enrich. Make sure to initialize the plugin first.`);
      return;
    }
    contexts.global_contexts.push(this.applicationContext);
  }

  /**
   * Make this plugin always usable
   */
  isUsable(): boolean {
    return true;
  }
}
