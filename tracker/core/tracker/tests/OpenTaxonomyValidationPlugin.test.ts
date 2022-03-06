/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { mockConsole } from '@objectiv/testing-tools';
import {
  makeContentContext,
  makePathContext,
  makeRootLocationContext,
  OpenTaxonomyValidationPlugin,
  TrackerEvent,
} from '../src';

describe('OpenTaxonomyValidationPlugin', () => {
  describe('RootLocationContext', () => {
    it('should succeed', () => {
      const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin({ console: mockConsole });
      const validEvent = new TrackerEvent({
        _type: 'test',
        location_stack: [makeRootLocationContext({ id: '/test' })],
        global_contexts: [makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testOpenTaxonomyValidationPlugin.validate(validEvent);

      expect(mockConsole.groupCollapsed).not.toHaveBeenCalled();
    });

    it('should fail when given TrackerEvent does not have RootLocationContext', () => {
      const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin({ console: mockConsole });
      const eventWithoutRootLocationContext = new TrackerEvent({
        _type: 'test',
        global_contexts: [makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testOpenTaxonomyValidationPlugin.validate(eventWithoutRootLocationContext);

      expect(mockConsole.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(mockConsole.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:OpenTaxonomyValidationPlugin:LocationContextValidationRule｣ Error: RootLocationContext is missing from Location Stack.`,
        'color:red'
      );
    });

    it('should fail when given TrackerEvent has multiple RootLocationContexts', () => {
      const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin({ console: mockConsole });
      const eventWithDuplicatedRootLocationContext = new TrackerEvent({
        _type: 'test',
        location_stack: [makeRootLocationContext({ id: '/test' }), makeRootLocationContext({ id: '/test' })],
        global_contexts: [makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testOpenTaxonomyValidationPlugin.validate(eventWithDuplicatedRootLocationContext);

      expect(mockConsole.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(mockConsole.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:OpenTaxonomyValidationPlugin:LocationContextValidationRule｣ Error: Only one RootLocationContext should be present in Location Stack.`,
        'color:red'
      );
    });

    it('should fail when given TrackerEvent has a RootLocationContext in the wrong position', () => {
      const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin({ console: mockConsole });
      const eventWithRootLocationContextInWrongPosition = new TrackerEvent({
        _type: 'test',
        location_stack: [makeContentContext({ id: 'content-id' }), makeRootLocationContext({ id: '/test' })],
        global_contexts: [makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testOpenTaxonomyValidationPlugin.validate(eventWithRootLocationContextInWrongPosition);

      expect(mockConsole.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(mockConsole.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:OpenTaxonomyValidationPlugin:LocationContextValidationRule｣ Error: RootLocationContext is in the wrong position of the Location Stack.`,
        'color:red'
      );
    });
  });

  describe('PathContext', () => {
    it('should succeed', () => {
      const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin({ console: mockConsole });
      const validEvent = new TrackerEvent({
        _type: 'test',
        location_stack: [makeRootLocationContext({ id: '/test' })],
        global_contexts: [makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testOpenTaxonomyValidationPlugin.validate(validEvent);

      expect(mockConsole.groupCollapsed).not.toHaveBeenCalled();
    });

    it('should fail when given TrackerEvent does not have PathContext', () => {
      const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin({ console: mockConsole });
      const eventWithoutPathContext = new TrackerEvent({
        _type: 'test',
        location_stack: [makeRootLocationContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testOpenTaxonomyValidationPlugin.validate(eventWithoutPathContext);

      expect(mockConsole.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(mockConsole.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:OpenTaxonomyValidationPlugin:GlobalContextValidationRule｣ Error: PathContext is missing from Global Contexts.`,
        'color:red'
      );
    });

    it('should fail when given TrackerEvent has multiple PathContexts', () => {
      const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin({ console: mockConsole });
      const eventWithDuplicatedPathContext = new TrackerEvent({
        _type: 'test',
        location_stack: [makeRootLocationContext({ id: '/test' })],
        global_contexts: [makePathContext({ id: '/test' }), makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testOpenTaxonomyValidationPlugin.validate(eventWithDuplicatedPathContext);

      expect(mockConsole.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(mockConsole.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:OpenTaxonomyValidationPlugin:GlobalContextValidationRule｣ Error: Only one PathContext should be present in Global Contexts.`,
        'color:red'
      );
    });
  });
});
