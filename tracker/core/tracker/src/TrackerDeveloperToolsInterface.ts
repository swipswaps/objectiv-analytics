/*
 * Copyright 2022 Objectiv B.V.
 */

import { LocationStack } from './Context';
import { GlobalContextValidationRuleFactory, LocationContextValidationRuleFactory } from './ContextValidationRules';
import { EventRecorderFactory } from './EventRecorderInterface';
import { LocationTreeInterface } from './LocationTreeInterface';
import { TrackerConsoleInterface } from './TrackerConsoleInterface';
import { TrackerEvent } from './TrackerEvent';

/**
 * DeveloperTools interface definition.
 */
export interface TrackerDeveloperToolsInterface {
  getLocationPath: (locationStack: LocationStack) => string;
  LocationTree: LocationTreeInterface;
  makeEventRecorder: EventRecorderFactory;
  makeGlobalContextValidationRule: GlobalContextValidationRuleFactory;
  makeLocationContextValidationRule: LocationContextValidationRuleFactory;
  recordedEvents: TrackerEvent[];
  TrackerConsole: TrackerConsoleInterface;
}
