/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeDocsURL } from '../helpers';
import { ContextValidationRuleConfig } from '../validationRules/ContextValidationRuleConfig';
import { ContextErrorMessages, ContextErrorType } from './ContextErrorMessages';

/**
 * The parameters of makeValidationRuleErrorMessage.
 */
export type MakeValidationRuleErrorMessageParameters = {
  rule: ContextValidationRuleConfig;
  type: ContextErrorType;
};

/**
 * Helper function to compile Context validation error messages for a specific platform and errorCode.
 */
export const makeValidationRuleErrorMessage = ({ rule, type }: MakeValidationRuleErrorMessageParameters) => {
  // Get messages for the given rule's platform and error type
  let errorMessagesForPlatformAndType = ContextErrorMessages[rule.platform][type];

  // Attempt to fetch context-specific error, or fallback to default message for the given platform / type combination
  let errorMessage = errorMessagesForPlatformAndType[rule.contextName] ?? errorMessagesForPlatformAndType['default'];

  // Replace placeholders with actual values
  errorMessage = errorMessage.replace(/{{docsURL}}/g, makeDocsURL());
  errorMessage = errorMessage.replace(/{{contextName}}/g, rule.contextName);

  // Make and return final error message string
  return `%c｢objectiv${rule.logPrefix ? ':' + rule.logPrefix : ''}｣ Error: ${errorMessage}`;
};
