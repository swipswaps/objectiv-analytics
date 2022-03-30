/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerPlatform } from '../Tracker';
import { TrackerValidationRuleConfig } from '../TrackerValidationRuleInterface';

/**
 * Defines options shared between rules that perform Context validation.
 */
export type ContextValidationRuleConfig = TrackerValidationRuleConfig & {
  /**
   * TrackerPlatform retrieved from the TrackerInstance. Used to retrieve platform-specific error messages.
   */
  platform: TrackerPlatform;

  /**
   * The name of the Context to validate, e.g. `RootLocationContext`, `ApplicationContext, etc.
   */
  contextName: string;

  /**
   * Optional. Restricts whether the specified LocationContext may be present multiple times.
   */
  once?: boolean;
};
