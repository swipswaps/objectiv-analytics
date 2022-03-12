/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { TrackerValidationRuleInterface } from '../TrackerValidationRuleInterface';

/**
 * Helper function to log Event Validation errors in a consistent way
 */
export const logEventValidationRuleError = (
  rule: TrackerValidationRuleInterface,
  event: TrackerEvent,
  message: string
) => {
  TrackerConsole.groupCollapsed(
    `%c｢objectiv:${rule.logPrefix ? rule.logPrefix.concat(':') : ''}${rule.validationRuleName}｣ Error: ${message}`,
    'color:red'
  );
  TrackerConsole.group(`Event:`);
  TrackerConsole.log(event);
  TrackerConsole.groupEnd();
  TrackerConsole.groupEnd();
};
