/*
 * Copyright 2022 Objectiv B.V.
 */

import { ContextType } from '../Context';
import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { TrackerValidationRuleInterface } from '../TrackerValidationRuleInterface';
import { ContextValidationRuleConfig } from './ContextValidationRuleConfig';

/**
 * A generic Rule to verify and console error when the required Context is not present.
 * TODO allow validation of context in the right position
 */
export class RequiresContextValidationRule implements TrackerValidationRuleInterface {
  readonly console?: TrackerConsole;
  readonly validationRuleName = `RequiresContextValidationRule`;
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
   * Verifies whether the given Context is present in the given TrackerEvent.
   */
  validate(event: TrackerEvent): void {
    const locationStackIndex = event.location_stack.findIndex((context) => context._type === this.contextName);
    const globalContextIndex = event.global_contexts.findIndex((context) => context._type === this.contextName);

    let isContextMissing;
    switch (this.contextType) {
      case ContextType.LocationContexts:
        isContextMissing = locationStackIndex < 0;
        break;
      case ContextType.GlobalContexts:
        isContextMissing = globalContextIndex < 0;
        break;
      default:
        isContextMissing = locationStackIndex < 0 && globalContextIndex < 0;
    }

    if (this.console && isContextMissing) {
      this.console.groupCollapsed(
        `%c｢objectiv:${this.validationRuleName}｣ Error: ${this.contextName} is missing.`,
        'color:red'
      );
      this.console.group(`Event:`);
      this.console.log(event);
      this.console.groupEnd();
      this.console.groupEnd();
    }
  }
}
