/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerDeveloperTools } from './TrackerDeveloperToolsInterface';
import { GlobalContextValidationRule } from './validationRules/GlobalContextValidationRule';
import { LocationContextValidationRule } from './validationRules/LocationContextValidationRule';

/**
 * A global object containing all DeveloperTools
 */
export const developerTools: TrackerDeveloperTools = {
  GlobalContextValidationRule,
  LocationContextValidationRule,
};

/**
 * Helper function to either create or extend objectiv globals with developerTools
 */
export const makeGlobalDeveloperTools = () => {
  globalThis.objectiv = { ...(globalThis.objectiv ?? {}), developerTools };

  return developerTools;
};
