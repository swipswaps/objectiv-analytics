/*
 * Copyright 2022 Objectiv B.V.
 */

import { GlobalContextValidationRuleFactory, LocationContextValidationRuleFactory } from './ContextValidationRules';
import { LocationTreeInterface } from './LocationTree';

/**
 * DeveloperTools interface definition.
 */
export interface TrackerDeveloperToolsInterface {
  LocationTree: LocationTreeInterface;
  makeGlobalContextValidationRule: GlobalContextValidationRuleFactory;
  makeLocationContextValidationRule: LocationContextValidationRuleFactory;
}
