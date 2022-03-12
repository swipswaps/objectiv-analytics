/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { MockConsoleImplementation } from '@objectiv/testing-tools';
import {
  ApplicationContextPlugin,
  ContextsConfig,
  makeApplicationContext,
  Tracker,
  TrackerConfig,
  TrackerConsole,
  TrackerEvent,
} from '../src';

TrackerConsole.setImplementation(MockConsoleImplementation);

const trackerConfig: TrackerConfig = { applicationId: 'app-id' };

describe('ApplicationContextPlugin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should generate an ApplicationContext when initialized', () => {
    const testApplicationContextPlugin = new ApplicationContextPlugin();
    new Tracker({ ...trackerConfig, plugins: [testApplicationContextPlugin] });
    expect(testApplicationContextPlugin.applicationContext).toEqual({
      __global_context: true,
      _type: 'ApplicationContext',
      id: 'app-id',
    });
  });

  it('should TrackerConsole.error when calling `enrich` before `initialize`', () => {
    const testApplicationContextPlugin = new ApplicationContextPlugin();
    const tracker = new Tracker({ ...trackerConfig });
    testApplicationContextPlugin.enrich(tracker);
    expect(MockConsoleImplementation.error).toHaveBeenCalledWith(
      '｢objectiv:ApplicationContextPlugin｣ Cannot enrich. Make sure to initialize the plugin first.'
    );
  });

  it('should add the ApplicationContext to the Event when `enrich` is executed by the Tracker', async () => {
    const plugins = new ApplicationContextPlugin();
    const testTracker = new Tracker({ ...trackerConfig, plugins: [plugins] });
    const eventContexts: ContextsConfig = {
      global_contexts: [
        { __global_context: true, _type: 'section', id: 'X' },
        { __global_context: true, _type: 'section', id: 'Y' },
      ],
    };
    const testEvent = new TrackerEvent({ _type: 'test-event', ...eventContexts });
    expect(testEvent.global_contexts).toHaveLength(2);
    const trackedEvent = await testTracker.trackEvent(testEvent);
    expect(trackedEvent.global_contexts).toHaveLength(3);
    expect(trackedEvent.global_contexts).toEqual(
      expect.arrayContaining([
        {
          __global_context: true,
          _type: 'ApplicationContext',
          id: 'app-id',
        },
      ])
    );
  });

  describe('Validation', () => {
    it('should succeed', () => {
      const testApplicationContextPlugin = new ApplicationContextPlugin();
      const validEvent = new TrackerEvent({
        _type: 'test',
        global_contexts: [makeApplicationContext({ id: 'test' })],
      });

      jest.resetAllMocks();

      testApplicationContextPlugin.validate(validEvent);

      expect(MockConsoleImplementation.groupCollapsed).not.toHaveBeenCalled();
    });

    it('should fail when given TrackerEvent does not have ApplicationContext', () => {
      const testApplicationContextPlugin = new ApplicationContextPlugin();
      const eventWithoutApplicationContext = new TrackerEvent({ _type: 'test' });

      jest.resetAllMocks();

      testApplicationContextPlugin.validate(eventWithoutApplicationContext);

      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:ApplicationContextPlugin:GlobalContextValidationRule｣ Error: ApplicationContext is missing from Global Contexts.`,
        'color:red'
      );
    });

    it('should fail when given TrackerEvent has multiple ApplicationContexts', () => {
      const testApplicationContextPlugin = new ApplicationContextPlugin();
      const eventWithDuplicatedApplicationContext = new TrackerEvent({
        _type: 'test',
        global_contexts: [makeApplicationContext({ id: 'test' }), makeApplicationContext({ id: 'test' })],
      });

      jest.resetAllMocks();

      testApplicationContextPlugin.validate(eventWithDuplicatedApplicationContext);

      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        `%c｢objectiv:ApplicationContextPlugin:GlobalContextValidationRule｣ Error: Only one ApplicationContext should be present in Global Contexts.`,
        'color:red'
      );
    });
  });
});
