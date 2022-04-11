/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackerDeveloperTools } from './TrackerDeveloperToolsInterface';

export * from './plugins/ApplicationContextPlugin';
export * from './plugins/OpenTaxonomyValidationPlugin';

export * from './cleanObjectFromInternalProperties';
export * from './Context';
export * from './ContextFactories';
export * from './EventFactories';
export * from './helpers';
export * from './NoopConsoleImplementation';
export * from './Tracker';
export * from './TrackerConsole';
export * from './TrackerDeveloperToolsInterface';
export * from './TrackerElementLocations';
export * from './TrackerEvent';
export * from './TrackerPluginInterface';
export * from './TrackerPluginLifecycleInterface';
export * from './TrackerPlugins';
export * from './TrackerQueue';
export * from './TrackerQueueInterface';
export * from './TrackerQueueMemoryStore';
export * from './TrackerQueueStoreInterface';
export * from './TrackerRepository';
export * from './TrackerRepositoryInterface';
export * from './TrackerTransportGroup';
export * from './TrackerTransportInterface';
export * from './TrackerTransportRetry';
export * from './TrackerTransportRetryAttempt';
export * from './TrackerTransportSwitch';
export * from './TrackerValidationRuleInterface';
export * from './TrackerValidationLifecycleInterface';

declare global {
  var objectiv:
    | undefined
    | {
        developerTools: TrackerDeveloperTools;
      };
}
