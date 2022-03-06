/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { mockConsole } from '@objectiv/testing-tools';
import { makeContentContext, makeRootLocationContext, OpenTaxonomyValidationPlugin, TrackerEvent } from '../src';

describe('OpenTaxonomyValidationPlugin', () => {
  it('should succeed', () => {
    const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin({ console: mockConsole });
    const validEvent = new TrackerEvent({
      _type: 'test',
      location_stack: [makeRootLocationContext({ id: '/test' })],
    });

    jest.resetAllMocks();

    testOpenTaxonomyValidationPlugin.validate(validEvent);

    expect(mockConsole.groupCollapsed).not.toHaveBeenCalled();
  });

  it('should fail when given TrackerEvent does not have RootLocationContext', () => {
    const testOpenTaxonomyValidationPlugin = new OpenTaxonomyValidationPlugin({ console: mockConsole });
    const eventWithoutRootLocationContext = new TrackerEvent({ _type: 'test' });

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
