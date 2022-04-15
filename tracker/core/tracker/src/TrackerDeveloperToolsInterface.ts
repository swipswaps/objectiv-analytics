/*
 * Copyright 2022 Objectiv B.V.
 */

import { GlobalContextValidationRuleFactory, LocationContextValidationRuleFactory } from './ContextValidationRules';

/**
 * DeveloperTools interface definition.
 */
export interface TrackerDeveloperToolsInterface {
  makeGlobalContextValidationRule: GlobalContextValidationRuleFactory;
  makeLocationContextValidationRule: LocationContextValidationRuleFactory;
}
