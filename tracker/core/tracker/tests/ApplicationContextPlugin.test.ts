/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { mockConsole } from '@objectiv/testing-tools';
import {
  ApplicationContextPlugin,
  ContextsConfig,
  makeApplicationContext,
  Tracker,
  TrackerConfig,
  TrackerEvent,
} from '../src';

const trackerConfig: TrackerConfig = { applicationId: 'app-id', console: mockConsole };

describe('ApplicationContextPlugin', () => {
  it('should generate an ApplicationContext when constructed', () => {
    const testApplicationContextPlugin = new ApplicationContextPlugin(trackerConfig);
    expect(testApplicationContextPlugin.applicationContext).toEqual({
      __global_context: true,
      _type: 'ApplicationContext',
      id: 'app-id',
    });
  });

  it('should add the ApplicationContext to the Event when `enrich` is executed by the Tracker', async () => {
    const plugins = new ApplicationContextPlugin(trackerConfig);
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

  it('should fail validation when given TrackerEvent does not have ApplicationContext', () => {
    const testApplicationContextPlugin = new ApplicationContextPlugin(trackerConfig);
    const eventWithoutApplicationContext = new TrackerEvent({ _type: 'test' });

    jest.resetAllMocks();

    testApplicationContextPlugin.validate(eventWithoutApplicationContext);

    expect(mockConsole.groupCollapsed).toHaveBeenCalledTimes(1);
    expect(mockConsole.groupCollapsed).toHaveBeenNthCalledWith(
      1,
      `%c｢objectiv:${testApplicationContextPlugin.pluginName}｣ Error: ApplicationContext is missing from Global Contexts.`,
      'color:red'
    );
  });

  it('should fail validation when given TrackerEvent has multiple ApplicationContexts', () => {
    const testApplicationContextPlugin = new ApplicationContextPlugin(trackerConfig);
    const eventWithoutApplicationContext = new TrackerEvent({
      _type: 'test',
      global_contexts: [makeApplicationContext({ id: 'test' }), makeApplicationContext({ id: 'test' })],
    });

    jest.resetAllMocks();

    testApplicationContextPlugin.validate(eventWithoutApplicationContext);

    expect(mockConsole.groupCollapsed).toHaveBeenCalledTimes(1);
    expect(mockConsole.groupCollapsed).toHaveBeenNthCalledWith(
      1,
      `%c｢objectiv:${testApplicationContextPlugin.pluginName}｣ Error: Only one ApplicationContext should be in Global Contexts.`,
      'color:red'
    );
  });
});
