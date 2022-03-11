/*
 * Copyright 2022 Objectiv B.V.
 */

import { mockConsoleImplementation } from '@objectiv/testing-tools';
import {
  makeContentContext,
  makePathContext,
  makeRootLocationContext,
  OpenTaxonomyValidationPlugin,
  TrackerConsole,
  TrackerEvent,
} from '../src';

TrackerConsole.setImplementation(mockConsoleImplementation);

describe('OpenTaxonomyValidationPlugin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('RootLocationContext', () => {
    it('should succeed', () => {
      const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin();
      const validEvent = new TrackerEvent({
        _type: 'test',
        location_stack: [makeRootLocationContext({ id: '/test' })],
        global_contexts: [makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testOpenTaxonomyValidationPlugin.validate(validEvent);

      expect(mockConsoleImplementation.groupCollapsed).not.toHaveBeenCalled();
    });

    it('should fail when given TrackerEvent does not have RootLocationContext', () => {
      const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin();
      const eventWithoutRootLocationContext = new TrackerEvent({
        _type: 'test',
        global_contexts: [makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testOpenTaxonomyValidationPlugin.validate(eventWithoutRootLocationContext);

      expect(mockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(mockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:OpenTaxonomyValidationPlugin:LocationContextValidationRule｣ Error: RootLocationContext is missing from Location Stack.`,
        'color:red'
      );
    });

    it('should fail when given TrackerEvent has multiple RootLocationContexts', () => {
      const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin();
      const eventWithDuplicatedRootLocationContext = new TrackerEvent({
        _type: 'test',
        location_stack: [makeRootLocationContext({ id: '/test' }), makeRootLocationContext({ id: '/test' })],
        global_contexts: [makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testOpenTaxonomyValidationPlugin.validate(eventWithDuplicatedRootLocationContext);

      expect(mockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(mockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:OpenTaxonomyValidationPlugin:LocationContextValidationRule｣ Error: Only one RootLocationContext should be present in Location Stack.`,
        'color:red'
      );
    });

    it('should fail when given TrackerEvent has a RootLocationContext in the wrong position', () => {
      const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin();
      const eventWithRootLocationContextInWrongPosition = new TrackerEvent({
        _type: 'test',
        location_stack: [makeContentContext({ id: 'content-id' }), makeRootLocationContext({ id: '/test' })],
        global_contexts: [makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testOpenTaxonomyValidationPlugin.validate(eventWithRootLocationContextInWrongPosition);

      expect(mockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(mockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:OpenTaxonomyValidationPlugin:LocationContextValidationRule｣ Error: RootLocationContext is in the wrong position of the Location Stack.`,
        'color:red'
      );
    });
  });
});
