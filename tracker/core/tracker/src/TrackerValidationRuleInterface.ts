/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackerConsole } from './TrackerConsole';
import { TrackerValidationLifecycleInterface } from "./TrackerValidationLifecycleInterface";

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
export interface TrackerValidationRuleInterface extends Required<TrackerValidationLifecycleInterface> {
  readonly console?: TrackerConsole;
  readonly validationRuleName: string;
}

/**
 * The TrackerValidationRule constructor interface.
 */
export interface TrackerValidationRuleConstructor {
  new (TrackerValidationRuleConfig: TrackerValidationRuleConfig): TrackerValidationRuleInterface;
}
