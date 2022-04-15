/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { matchUUID, MockConsoleImplementation } from '@objectiv/testing-tools';
import { GlobalContextName, LocationContextName, Tracker, TrackerConfig, TrackerConsole } from '../src';

import '@objectiv/developer-tools';

TrackerConsole.setImplementation(MockConsoleImplementation);

describe('Tracker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('developers tools should have been imported', async () => {
    expect(globalThis.objectiv?.developerTools).not.toBeUndefined();
  });

  it('should instantiate with just applicationId (with developer tools)', async () => {
    jest.spyOn(console, 'log');
    expect(console.log).not.toHaveBeenCalled();
    const trackerConfig: TrackerConfig = { applicationId: 'app-id' };
    const testTracker = new Tracker(trackerConfig);
    expect(testTracker).toBeInstanceOf(Tracker);
    expect(testTracker.transport).toBe(undefined);
    expect(testTracker.plugins.plugins).toEqual([
      {
        pluginName: 'OpenTaxonomyValidationPlugin',
        initialized: true,
        validationRules: [
          {
            validationRuleName: 'GlobalContextValidationRule',
            logPrefix: 'OpenTaxonomyValidationPlugin',
            contextName: GlobalContextName.ApplicationContext,
            platform: 'CORE',
            once: true,
            validate: expect.any(Function),
          },
          {
            validationRuleName: 'LocationContextValidationRule',
            logPrefix: 'OpenTaxonomyValidationPlugin',
            contextName: LocationContextName.RootLocationContext,
            platform: 'CORE',
            position: 0,
            once: true,
            validate: expect.any(Function),
          },
        ],
      },
      {
        pluginName: 'ApplicationContextPlugin',
        applicationContext: {
          __instance_id: matchUUID,
          __global_context: true,
          _type: GlobalContextName.ApplicationContext,
          id: 'app-id',
        },
      },
    ]);
    expect(testTracker.applicationId).toBe('app-id');
    expect(testTracker.location_stack).toStrictEqual([]);
    expect(testTracker.global_contexts).toStrictEqual([]);
    expect(console.log).not.toHaveBeenCalled();
  });
});
