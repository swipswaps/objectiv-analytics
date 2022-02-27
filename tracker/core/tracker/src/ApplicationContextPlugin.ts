/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { ApplicationContext } from '@objectiv/schema';
import { ContextsConfig } from './Context';
import { makeApplicationContext } from './ContextFactories';
import { RequiresContextValidationRule } from "./RequiresContextValidationRule";
import { TrackerConfig } from './Tracker';
import { TrackerConsole } from './TrackerConsole';
import { TrackerEvent } from './TrackerEvent';
import { TrackerPluginConfig, TrackerPluginInterface } from './TrackerPluginInterface';
import { UniqueContextValidationRule } from "./UniqueContextValidationRule";

/**
 * The ApplicationContextPlugin Config object.
 */
export type ApplicationContextPluginConfig = TrackerPluginConfig & Pick<TrackerConfig, 'applicationId'>;

/**
 * The ApplicationContextPlugin adds an ApplicationContext as GlobalContext before events are transported.
 */
export class ApplicationContextPlugin implements TrackerPluginInterface {
  readonly console?: TrackerConsole;
  readonly pluginName = `ApplicationContextPlugin`;
  readonly applicationContext: ApplicationContext;

  /**
   * Generates a ApplicationContext from the given config applicationId.
   */
  constructor(config: ApplicationContextPluginConfig) {
    this.console = config.console;
    this.applicationContext = makeApplicationContext({
      id: config.applicationId,
    });

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
   * Verifies whether ApplicationContext
   * - is present in Global Contexts
   * - is not present multiple times
   */
  validate(event: TrackerEvent): void {
    new RequiresContextValidationRule({ contextType: 'ApplicationContext', console: this.console }).validate(event);
    new UniqueContextValidationRule({ contextType: 'ApplicationContext', console: this.console }).validate(event);
  }

  /**
   * Make this plugin always usable
   */
  isUsable(): boolean {
    return true;
  }
}
