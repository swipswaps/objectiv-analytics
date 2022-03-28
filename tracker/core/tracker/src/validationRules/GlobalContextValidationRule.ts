/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { TrackerValidationRuleInterface } from '../TrackerValidationRuleInterface';
import { ContextValidationRuleConfig } from './ContextValidationRuleConfig';
import { logEventValidationRuleError } from './logEventValidationRuleError';

/**
 * A generic configurable Rule that can verify, and console error, whether the given `context` is:
 * - present in Global Contexts
 * - optionally, present only once
 */
export class GlobalContextValidationRule implements TrackerValidationRuleInterface, ContextValidationRuleConfig {
  readonly validationRuleName = `GlobalContextValidationRule`;
  readonly contextName: string;
  readonly once?: boolean;
  readonly logPrefix?: string;

  /**
   * Process config onto state.
   */
  constructor(config: ContextValidationRuleConfig) {
    this.contextName = config.contextName;
    this.once = config.once;
    this.logPrefix = config.logPrefix;

    TrackerConsole.groupCollapsed(
      `｢objectiv:${this.logPrefix?.concat(':')}${this.validationRuleName}｣ Initialized. Context: ${config.contextName}.`
    );
    TrackerConsole.group(`Configuration:`);
    TrackerConsole.log(config);
    TrackerConsole.groupEnd();
    TrackerConsole.groupEnd();
  }

  /**
   * Verifies whether the given Context is present in the given TrackerEvent.
   */
  validate(event: TrackerEvent): void {
    const matches = event.global_contexts.filter((context) => context._type === this.contextName);

    if (!matches.length) {
      logEventValidationRuleError(this, event, `${this.contextName} is missing from Global Contexts.`);
    } else if (this.once && matches.length > 1) {
      logEventValidationRuleError(this, event, `Only one ${this.contextName} should be present in Global Contexts.`);
    }
  }
}
