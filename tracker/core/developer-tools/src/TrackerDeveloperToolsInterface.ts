/*
 * Copyright 2022 Objectiv B.V.
 */

import {
  GlobalContextName,
  GlobalContextValidationRule,
  LocationContextName,
  LocationContextValidationRule,
} from '@objectiv/developer-tools';

/**
 * DeveloperTools interface definition.
 */
export interface TrackerDeveloperTools {
  GlobalContextName: typeof GlobalContextName;
  GlobalContextValidationRule: typeof GlobalContextValidationRule;
  LocationContextName: typeof LocationContextName;
  LocationContextValidationRule: typeof LocationContextValidationRule;
}
