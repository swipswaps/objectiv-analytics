/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { ContextErrorType } from './ContextErrorMessages';
import { ContextValidationRuleConfig } from './ContextValidationRuleConfig';
import { makeValidationRuleErrorMessage } from './makeValidationRuleErrorMessage';

/**
 * The parameters of logContextValidationRuleError.
 */
export type LogContextValidationRuleErrorParameters = {
  rule: ContextValidationRuleConfig;
  event: TrackerEvent;
  type: ContextErrorType;
};

/**
 * Helper function to log Context Validation Rule errors in a consistent way.
 */
export const logContextValidationRuleError = ({ rule, event, type }: LogContextValidationRuleErrorParameters) => {
  TrackerConsole.groupCollapsed(makeValidationRuleErrorMessage({ rule, event, type }), 'color:red');
  TrackerConsole.group(`Event:`);
  TrackerConsole.log(event);
  TrackerConsole.groupEnd();
  TrackerConsole.groupEnd();
};
