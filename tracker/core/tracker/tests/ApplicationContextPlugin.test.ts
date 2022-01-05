/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { ApplicationContextPlugin, ContextsConfig, Tracker, TrackerConfig, TrackerEvent, TrackerPlugins } from '../src';

const trackerConfig: TrackerConfig = { applicationId: 'app-id' };

describe('ApplicationContextPlugin', () => {
  it('should generate an ApplicationContext when constructed', () => {
    const testApplicationContextPlugin = new ApplicationContextPlugin(trackerConfig);
    expect(testApplicationContextPlugin.applicationContext).toEqual({
      __global_context: true,
      _type: 'ApplicationContext',
      id: 'app-id',
    });
  });

  it('should add the ApplicationContext to the Event when `beforeTransport` is executed by the Tracker', async () => {
    const plugins = new ApplicationContextPlugin(trackerConfig);
    const trackerPlugins = new TrackerPlugins({ plugins: [plugins] });
    const testTracker = new Tracker({ ...trackerConfig, plugins: trackerPlugins });
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
});
