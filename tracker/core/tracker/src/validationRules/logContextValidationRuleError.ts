/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { ContextValidationRuleConfig } from './ContextValidationRuleConfig';
import { ErrorCode } from './ErrorMessages';
import { makeValidationRuleErrorMessage } from './makeValidationRuleErrorMessage';

/**
 * The parameters of logContextValidationRuleError.
 */
export type LogContextValidationRuleErrorParameters = {
  rule: ContextValidationRuleConfig;
  event: TrackerEvent;
  errorCode: ErrorCode;
};

/**
 * Helper function to log Context Validation Rule errors in a consistent way.
 */
export const logContextValidationRuleError = ({ rule, event, errorCode }: LogContextValidationRuleErrorParameters) => {
  TrackerConsole.groupCollapsed(makeValidationRuleErrorMessage({ rule, errorCode }), 'color:red');
  TrackerConsole.group(`Event:`);
  TrackerConsole.log(event);
  TrackerConsole.groupEnd();
  TrackerConsole.groupEnd();
};
