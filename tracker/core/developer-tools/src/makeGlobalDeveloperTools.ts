/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerDeveloperToolsInterface } from '@objectiv/tracker-core';
import { makeGlobalContextValidationRule } from './validationRules/makeGlobalContextValidationRule';
import { makeLocationContextValidationRule } from './validationRules/makeLocationContextValidationRule';

/**
 * A global object containing all DeveloperTools
 */
export const developerTools: TrackerDeveloperToolsInterface = {
  makeGlobalContextValidationRule,
  makeLocationContextValidationRule,
};

/**
 * Helper function to either create or extend objectiv globals with developerTools
 */
export const makeGlobalDeveloperTools = () => {
  globalThis.objectiv = { ...(globalThis.objectiv ?? {}), ...developerTools };

  return developerTools;
};
