/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerDeveloperToolsInterface } from "@objectiv/tracker-core";
import { LocationTree } from "./LocationTree";
import { makeGlobalContextValidationRule } from "./validationRules/makeGlobalContextValidationRule";
import { makeLocationContextValidationRule } from "./validationRules/makeLocationContextValidationRule";

/**
 * A global object containing all DeveloperTools
 */
const developerTools: TrackerDeveloperToolsInterface = {
  LocationTree: LocationTree,
  makeGlobalContextValidationRule,
  makeLocationContextValidationRule,
};

/**
 * Extend or set global objectiv interface with developer tools
 */
globalThis.objectiv = { ...(globalThis.objectiv ?? {}), ...developerTools };
