/*
 * Copyright 2022 Objectiv B.V.
 */

import { ContextType } from '../Context';
import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { TrackerValidationRuleInterface } from '../TrackerValidationRuleInterface';
import { ContextValidationRuleConfig } from './ContextValidationRuleConfig';

/**
 * A generic Rule to verify and console error when the required Context is present multiple times.
 */
export class UniqueContextValidationRule implements TrackerValidationRuleInterface {
  readonly console?: TrackerConsole;
  readonly validationRuleName = `UniqueContextValidationRule`;
  readonly contextName;
  readonly contextType;

  /**
   * Process config onto state.
   */
  constructor(config: ContextValidationRuleConfig) {
    this.console = config.console;
    this.contextName = config.contextName;
    this.contextType = config.contextType;

    if (this.console) {
      this.console.groupCollapsed(`｢objectiv:${this.validationRuleName}｣ Initialized. Context: ${config.contextName}.`);
      this.console.group(`Configuration:`);
      this.console.log(config);
      this.console.groupEnd();
      this.console.groupEnd();
    }
  }

  /**
   * Verifies whether the given Context is not present multiple times in the given TrackerEvent.
   */
  validate(event: TrackerEvent): void {
    const locationStackMatches = event.location_stack.filter((context) => context._type === this.contextName);
    const globalContextMatches = event.global_contexts.filter((context) => context._type === this.contextName);

    let isContextDuplicated;
    switch (this.contextType) {
      case ContextType.LocationContexts:
        isContextDuplicated = locationStackMatches.length > 1;
        break;
      case ContextType.GlobalContexts:
        isContextDuplicated = globalContextMatches.length > 1;
        break;
      default:
        isContextDuplicated = locationStackMatches.length > 1 || globalContextMatches.length > 1;
    }

    if (this.console && isContextDuplicated) {
      this.console.groupCollapsed(
        `%c｢objectiv:${this.validationRuleName}｣ Error: Only one ${this.contextName} should be present.`,
        'color:red'
      );
      this.console.group(`Event:`);
      this.console.log(event);
      this.console.groupEnd();
      this.console.groupEnd();
    }
  }
}
