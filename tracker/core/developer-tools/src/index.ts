/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeGlobalDeveloperTools } from './makeGlobalDeveloperTools';
import { TrackerDeveloperTools } from './TrackerDeveloperToolsInterface';

export * from './validationRules/ContextValidationRuleConfig';
export * from './validationRules/GlobalContextValidationRule';
export * from './validationRules/LocationContextValidationRule';

export * from './ContextErrorMessages';
export * from './ContextErrorType';
export * from './ContextNames';
export * from './makeGlobalDeveloperTools';
export * from './TrackerDeveloperToolsInterface';
export * from './types';

const developerTools = makeGlobalDeveloperTools();

export default developerTools;

declare global {
  var objectiv:
    | undefined
    | {
        developerTools?: TrackerDeveloperTools;
      };
}
