/*
 * Copyright 2022 Objectiv B.V.
 */

import { ContextType } from '@objectiv/tracker-core';
import { TrackerValidationRuleConfig } from '../TrackerValidationRuleInterface';

/**
 * Defines options shared between rules that perform Context validation.
 */
export type ContextValidationRuleConfig = TrackerValidationRuleConfig & {
  /**
   * The name of the Context to validate, e.g. `ApplicationContext`.
   */
  contextName: string;

  /**
   * Optional. Restricts whether the specified contextName is checked against `location_stack` or `global_contexts`.
   */

  contextType?: ContextType;
};
