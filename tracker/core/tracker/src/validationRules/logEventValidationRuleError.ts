/*
 * Copyright 2022 Objectiv B.V.
 */

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
  if (!rule.console) {
    return;
  }

  rule.console.groupCollapsed(
    `%c｢objectiv:${rule.logPrefix?.concat(':')}${rule.validationRuleName}｣ Error: ${message}`,
    'color:red'
  );
  rule.console.group(`Event:`);
  rule.console.log(event);
  rule.console.groupEnd();
  rule.console.groupEnd();
};
