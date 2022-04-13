/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerPlatform, TrackerValidationRuleConfig } from '@objectiv/tracker-core';
import { ContextName } from '../types';

/**
 * Defines options shared between rules that perform Context validation.
 */
export type ContextValidationRuleConfig<ContextType extends ContextName> = TrackerValidationRuleConfig & {
  /**
   * TrackerPlatform retrieved from the TrackerInstance. Used to retrieve platform-specific error messages.
   */
  platform: TrackerPlatform;

  /**
   * The name of the Context to validate, e.g. `RootLocationContext`, `ApplicationContext, etc.
   */
  contextName: ContextType;

  /**
   * Optional. Restricts whether the specified Context may be present multiple times.
   */
  once?: boolean;
};
