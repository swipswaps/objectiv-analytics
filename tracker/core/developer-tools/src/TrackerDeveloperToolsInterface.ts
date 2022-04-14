/*
 * Copyright 2022 Objectiv B.V.
 */

import { GlobalContextValidationRule, LocationContextValidationRule } from '@objectiv/developer-tools';

/**
 * DeveloperTools interface definition.
 */
export interface TrackerDeveloperTools {
  GlobalContextValidationRule: typeof GlobalContextValidationRule;
  LocationContextValidationRule: typeof LocationContextValidationRule;
}
