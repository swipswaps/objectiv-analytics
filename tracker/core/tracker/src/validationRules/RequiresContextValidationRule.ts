/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackerConsole } from '../TrackerConsole';
import { TrackerEvent } from '../TrackerEvent';
import { TrackerValidationRuleConfig, TrackerValidationRuleInterface } from '../TrackerValidationRuleInterface';

/**
 * The RequiresContextValidationRule Config object.
 */
type RequiresContextValidationRuleConfig = TrackerValidationRuleConfig & {
  contextType: string;
};

/**
 * A generic Rule to verify and console error when the required Context is not present.
 */
export class RequiresContextValidationRule implements TrackerValidationRuleInterface {
  readonly console?: TrackerConsole;
  readonly validationRuleName = `RequiresContextValidationRule`;
  readonly contextType;

  /**
   * Set console and contextType in state.
   */
  constructor(config: RequiresContextValidationRuleConfig) {
    this.console = config.console;
    this.contextType = config.contextType;

    if (this.console) {
      this.console.log(
        `%c｢objectiv:${this.validationRuleName}｣ Initialized. Context: ${config.contextType}.`,
        'font-weight:bold'
      );
    }
  }

  /**
   * Verifies whether the given Context is present in the given TrackerEvent
   */
  validate(event: TrackerEvent): void {
    const locationStack = event.location_stack.filter((locationContext) => locationContext._type === this.contextType);
    const globalContexts = event.global_contexts.filter((globalContext) => globalContext._type === this.contextType);

    if (this.console) {
      if (!locationStack.length && !globalContexts.length) {
        this.console.groupCollapsed(
          `%c｢objectiv:${this.validationRuleName}｣ Error: ${this.contextType} is missing.`,
          'color:red'
        );
        this.console.group(`Event:`);
        this.console.log(event);
        this.console.groupEnd();
        this.console.groupEnd();
      }
    }
  }
}
