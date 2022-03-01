/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerConsole } from './TrackerConsole';
import { TrackerValidationLifecycleInterface } from './TrackerValidationLifecycleInterface';

/**
 * The TrackerValidationRuleConfig.
 */
export type TrackerValidationRuleConfig = {
  /**
   * Optional. A TrackerConsole instance for logging.
   */
  console?: TrackerConsole;

  /**
   * Optional. Allows adding further information to the logging prefix, e.g. ｢objectiv:<logPrefix><ruleName>｣<message>
   */
  logPrefix?: string;
};

/**
 * A ValidationRule must define its own `validationRuleName` and must define a `validate` callback.
 */
export interface TrackerValidationRuleInterface extends Required<TrackerValidationLifecycleInterface> {
  readonly console?: TrackerConsole;
  readonly validationRuleName: string;
  readonly logPrefix?: string;
}

/**
 * The TrackerValidationRule constructor interface.
 */
export interface TrackerValidationRuleConstructor {
  new (TrackerValidationRuleConfig: TrackerValidationRuleConfig): TrackerValidationRuleInterface;
}
