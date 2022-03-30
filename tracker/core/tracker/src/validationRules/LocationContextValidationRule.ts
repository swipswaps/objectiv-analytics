/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerPlatform } from '../Tracker';
import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { TrackerValidationRuleInterface } from '../TrackerValidationRuleInterface';
import { ContextErrorType } from './ContextErrorMessages';
import { ContextValidationRuleConfig } from './ContextValidationRuleConfig';
import { logContextValidationRuleError } from './logContextValidationRuleError';

/**
 * LocationStack order matters, the LocationContextValidationRule config supports specifying a required position.
 */
export type LocationContextValidationRuleConfig = ContextValidationRuleConfig & {
  /**
   * Optional. Restricts in which position the specified LocationContext may be.
   */
  position?: number;
};

/**
 * A generic configurable Rule that can verify, and console error, whether the given `context` is:
 * - present in Location Stack
 * - optionally, present only once
 * - optionally, present in a specific position
 */
export class LocationContextValidationRule
  implements TrackerValidationRuleInterface, LocationContextValidationRuleConfig
{
  readonly validationRuleName = `LocationContextValidationRule`;
  readonly platform: TrackerPlatform;
  readonly contextName: string;
  readonly once?: boolean;
  readonly position?: number;
  readonly logPrefix?: string;

  /**
   * Process config onto state.
   */
  constructor(config: LocationContextValidationRuleConfig) {
    this.platform = config.platform;
    this.contextName = config.contextName;
    this.once = config.once;
    this.position = config.position;
    this.logPrefix = config.logPrefix;

    TrackerConsole.groupCollapsed(
      `｢objectiv:${this.logPrefix ? ':' + this.logPrefix : ''}${this.validationRuleName}｣ Initialized. Context: ${
        config.contextName
      }.`
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
    const index = event.location_stack.findIndex((context) => context._type === this.contextName);
    const matches = event.location_stack.filter((context) => context._type === this.contextName);

    if (!matches.length) {
      logContextValidationRuleError({ rule: this, event, type: ContextErrorType.LOCATION_CONTEXT_MISSING });
    } else if (this.once && matches.length > 1) {
      logContextValidationRuleError({ rule: this, event, type: ContextErrorType.LOCATION_CONTEXT_DUPLICATED });
    } else if (typeof this.position === 'number' && index !== this.position) {
      logContextValidationRuleError({ rule: this, event, type: ContextErrorType.LOCATION_CONTEXT_WRONG_POSITION });
    }
  }
}
