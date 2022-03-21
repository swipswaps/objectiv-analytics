/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerValidationRuleConfig } from '../TrackerValidationRuleInterface';

/**
 * Defines options shared between rules that perform Context validation.
 */
export type ContextValidationRuleConfig = TrackerValidationRuleConfig & {
  /**
   * The name of the Context to validate, e.g. `RootLocationContext`, `ApplicationContext, etc.
   */
  contextName: string;

  /**
   * Optional. Restricts whether the specified LocationContext may be present multiple times.
   */
  once?: boolean;
};
