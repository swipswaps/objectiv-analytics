/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeDocsURL } from '../helpers';
import { ContextValidationRuleConfig } from '../validationRules/ContextValidationRuleConfig';
import { ErrorCode, ErrorMessages } from './ErrorMessages';

/**
 * The parameters of makeValidationRuleErrorMessage.
 */
export type MakeValidationRuleErrorMessageParameters = {
  rule: ContextValidationRuleConfig;
  errorCode: ErrorCode;
};

/**
 * Helper function to compile Context validation error messages for a specific platform and errorCode.
 */
export const makeValidationRuleErrorMessage = ({ rule, errorCode }: MakeValidationRuleErrorMessageParameters) => {
  // Load platform specific error message for the given rule's platform and errorCode
  let errorMessage = ErrorMessages[rule.platform][errorCode];

  // Replace placeholders with actual values
  errorMessage = errorMessage.replace(/{docsURL}/g, makeDocsURL());
  errorMessage = errorMessage.replace(/{contextName}/g, rule.contextName);

  // Make and return final error message string
  return `%c｢objectiv${rule.logPrefix ? ':' + rule.logPrefix : ''}｣ Error: ${errorMessage}`;
};
