/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { mockConsole } from '@objectiv/testing-tools';
import { ContextsConfig, makePathContext, Tracker, TrackerEvent } from '@objectiv/tracker-core';
import { PathContextFromURLPlugin } from '../src';

describe('PathContextFromURLPlugin', () => {
  it('should instantiate without a console', () => {
    const testPathContextPlugin = new PathContextFromURLPlugin();
    expect(testPathContextPlugin).toBeInstanceOf(PathContextFromURLPlugin);
    expect(testPathContextPlugin.console).toBeUndefined();
  });

  it('should instantiate with the given console', () => {
    const testPathContextPlugin = new PathContextFromURLPlugin({ console: mockConsole });
    expect(testPathContextPlugin).toBeInstanceOf(PathContextFromURLPlugin);
    expect(testPathContextPlugin.console).toBe(mockConsole);
  });

  it('should add the PathContext to the Event when `enrich` is executed by the Tracker', async () => {
    const testTracker = new Tracker({
      applicationId: 'app-id',
      plugins: [new PathContextFromURLPlugin()],
    });
    const eventContexts: ContextsConfig = {
      location_stack: [
        { __location_context: true, _type: 'section', id: 'A' },
        { __location_context: true, _type: 'section', id: 'B' },
      ],
      global_contexts: [
        { __global_context: true, _type: 'GlobalA', id: 'abc' },
        { __global_context: true, _type: 'GlobalB', id: 'def' },
      ],
    };
    const testEvent = new TrackerEvent({ _type: 'test-event', ...eventContexts });
    expect(testEvent.location_stack).toHaveLength(2);
    const trackedEvent = await testTracker.trackEvent(testEvent);
    expect(trackedEvent.location_stack).toHaveLength(2);
    expect(trackedEvent.global_contexts).toHaveLength(3);
    expect(trackedEvent.global_contexts).toEqual(
      expect.arrayContaining([
        {
          __global_context: true,
          _type: 'PathContext',
          id: 'http://localhost/',
        },
      ])
    );
  });

  describe('Validation', () => {
    it('should succeed', () => {
      const testPathContextPlugin = new PathContextFromURLPlugin({ console: mockConsole });
      const validEvent = new TrackerEvent({
        _type: 'test',
        global_contexts: [makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testPathContextPlugin.validate(validEvent);

      expect(mockConsole.groupCollapsed).not.toHaveBeenCalled();
    });

    it('should fail when given TrackerEvent does not have PathContext', () => {
      const testPathContextPlugin = new PathContextFromURLPlugin({ console: mockConsole });
      const eventWithoutPathContext = new TrackerEvent({ _type: 'test' });

      jest.resetAllMocks();

      testPathContextPlugin.validate(eventWithoutPathContext);

      expect(mockConsole.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(mockConsole.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:GlobalContextValidationRule｣ Error: PathContext is missing from Global Contexts.`,
        'color:red'
      );
    });

    it('should fail when given TrackerEvent has multiple PathContexts', () => {
      const testPathContextPlugin = new PathContextFromURLPlugin({ console: mockConsole });
      const eventWithDuplicatedPathContext = new TrackerEvent({
        _type: 'test',
        global_contexts: [makePathContext({ id: '/test' }), makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testPathContextPlugin.validate(eventWithDuplicatedPathContext);

      expect(mockConsole.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(mockConsole.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:GlobalContextValidationRule｣ Error: Only one PathContext should be present in Global Contexts.`,
        'color:red'
      );
    });
  });
});
