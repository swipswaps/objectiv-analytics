/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { matchUUID, MockConsoleImplementation } from '@objectiv/testing-tools';
import {
  GlobalContextName,
  LocationContextName,
  Tracker,
  TrackerConfig,
  TrackerConsole,
  TrackerPlatform,
} from '../src';

TrackerConsole.setImplementation(MockConsoleImplementation);

describe('Tracker', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should instantiate with just applicationId (with developer tools)', async () => {
    const { GlobalContextValidationRule, LocationContextValidationRule } = await import('@objectiv/developer-tools');

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
          new GlobalContextValidationRule({
            platform: TrackerPlatform.CORE,
            logPrefix: 'OpenTaxonomyValidationPlugin',
            contextName: GlobalContextName.ApplicationContext,
            once: true,
          }),
          new LocationContextValidationRule({
            platform: TrackerPlatform.CORE,
            logPrefix: 'OpenTaxonomyValidationPlugin',
            contextName: LocationContextName.RootLocationContext,
            once: true,
            position: 0,
          }),
        ],
      },
      {
        pluginName: 'ApplicationContextPlugin',
        applicationContext: {
          __instance_id: matchUUID,
          __global_context: true,
          _type: 'ApplicationContext',
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
