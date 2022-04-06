/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerConsole, TrackerEvent, TrackerPlatform, TrackerValidationRuleInterface } from '@objectiv/tracker-core';
import { GlobalContextErrorMessages } from "../ContextErrorMessages";
import { GlobalContextErrorType } from "../ContextErrorType";
import { GlobalContextName } from '../ContextNames';
import { ContextValidationRuleConfig } from './ContextValidationRuleConfig';

/**
 * GlobalContextValidationRule config object.
 */
export type GlobalContextValidationRuleConfig = ContextValidationRuleConfig<GlobalContextName>;

/**
 * A generic configurable Rule that can verify, and console error, whether the given `context` is:
 * - present in Global Contexts
 * - optionally, present only once
 */
export class GlobalContextValidationRule implements TrackerValidationRuleInterface, GlobalContextValidationRuleConfig {
  readonly validationRuleName = `GlobalContextValidationRule`;
  readonly platform: TrackerPlatform;
  readonly contextName: GlobalContextName;
  readonly once?: boolean;
  readonly logPrefix?: string;

  /**
   * Process config onto state.
   */
  constructor(config: GlobalContextValidationRuleConfig) {
    this.platform = config.platform;
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

    let errorType: GlobalContextErrorType | null = null;
    if (!matches.length) {
      errorType = GlobalContextErrorType.GLOBAL_CONTEXT_MISSING;
    } else if (this.once && matches.length > 1) {
      errorType = GlobalContextErrorType.GLOBAL_CONTEXT_DUPLICATED;
    }

    if (errorType) {
      const errorMessagePrefix = `｢objectiv${this.logPrefix ? ':' + this.logPrefix : ''}｣`;
      const errorMessageTemplate = GlobalContextErrorMessages[this.platform][errorType][this.contextName];
      const errorMessageBody = errorMessageTemplate.replace(/{{eventName}}/g, event._type);

      TrackerConsole.groupCollapsed(`%c${errorMessagePrefix} Error: ${errorMessageBody}`, 'color:red');
      TrackerConsole.group(`Event:`);
      TrackerConsole.log(event);
      TrackerConsole.groupEnd();
      TrackerConsole.groupEnd();
    }
  }
}
