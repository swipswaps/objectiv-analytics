/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerConsole, TrackerEvent, TrackerPlatform, TrackerValidationRuleInterface } from '@objectiv/tracker-core';
import { LocationContextErrorMessages } from "../ContextErrorMessages";
import { LocationContextErrorType } from "../ContextErrorType";
import { LocationContextName } from '../ContextNames';
import { ContextValidationRuleConfig } from './ContextValidationRuleConfig';

/**
 * LocationStack order matters, the LocationContextValidationRule config supports specifying a required position.
 */
export type LocationContextValidationRuleConfig = ContextValidationRuleConfig<LocationContextName> & {
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
  readonly contextName: LocationContextName;
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

    let errorType: LocationContextErrorType | null = null;
    if (!matches.length) {
      errorType = LocationContextErrorType.LOCATION_CONTEXT_MISSING;
    } else if (this.once && matches.length > 1) {
      errorType = LocationContextErrorType.LOCATION_CONTEXT_DUPLICATED;
    } else if (typeof this.position === 'number' && index !== this.position) {
      errorType = LocationContextErrorType.LOCATION_CONTEXT_WRONG_POSITION;
    }

    if (errorType) {
      const errorMessagePrefix = `｢objectiv${this.logPrefix ? ':' + this.logPrefix : ''}｣`;
      const errorMessageTemplate = LocationContextErrorMessages[this.platform][errorType][this.contextName];
      const errorMessageBody = errorMessageTemplate.replace(/{{eventName}}/g, event._type);

      TrackerConsole.groupCollapsed(`%c${errorMessagePrefix} Error: ${errorMessageBody}`, 'color:red');
      TrackerConsole.group(`Event:`);
      TrackerConsole.log(event);
      TrackerConsole.groupEnd();
      TrackerConsole.groupEnd();
    }
  }
}
