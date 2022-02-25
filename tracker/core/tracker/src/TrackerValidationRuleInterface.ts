/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackerConsole } from './TrackerConsole';
import { TrackerEvent } from './TrackerEvent';
import { TrackerPluginLifecycleInterface } from './TrackerPluginLifecycleInterface';

/**
 * The TrackerValidationRuleConfig.
 */
export type TrackerValidationRuleConfig = {
  /**
   * Optional. A TrackerConsole instance for logging.
   */
  console?: TrackerConsole;
};

/**
 * A ValidationRule must define its own `validationRuleName` and must define a `validate` callback.
 */
export interface TrackerValidationRuleInterface extends TrackerPluginLifecycleInterface {
  readonly console?: TrackerConsole;
  readonly validationRuleName: string;

  /**
   * Validation logic may be implemented via this method and may log issues to the console.
   */
  validate: (event: TrackerEvent) => void;
}

/**
 * The TrackerValidationRule constructor interface.
 */
export interface TrackerValidationRuleConstructor {
  new (TrackerValidationRuleConfig: TrackerValidationRuleConfig): TrackerValidationRuleInterface;
}
