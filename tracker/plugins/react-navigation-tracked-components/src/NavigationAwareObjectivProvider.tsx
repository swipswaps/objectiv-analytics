/*
 * Copyright 2022 Objectiv B.V.
 */

import { makePathContext } from '@objectiv/tracker-core';
import {
  makeRootLocationContext,
  ObjectivProviderContext,
  objectivProviderDefaultOptions,
  ObjectivProviderProps,
  trackApplicationLoadedEvent,
  TrackingContextProvider,
  useOnMount,
} from '@objectiv/tracker-react-core';
import { getPathFromState, NavigationContainerRefWithCurrent } from '@react-navigation/native';
import React, { useContext } from 'react';

/**
 * NavigationAwareObjectivProvider requires an extra `navigationContainerRef` prop.
 */
export type NavigationAwareObjectivProviderProps<ParamList extends ReactNavigation.RootParamList> =
  ObjectivProviderProps & {
    navigationContainerRef: NavigationContainerRefWithCurrent<ParamList>;
  };

/**
 * An ObjectivProvider variant able to automatically infer RootLocationContext and PathContext from React Navigation.
 * Additionally, it will wait until React Navigation is ready, before triggering ApplicationLoadedEvent.
 * This ensures the RootLocationContext and PathContext are up-to-date.
 */
export function NavigationAwareObjectivProvider<ParamList extends ReactNavigation.RootParamList>({
  children,
  tracker,
  navigationContainerRef,
  options,
}: NavigationAwareObjectivProviderProps<ParamList>) {
  const { trackApplicationLoaded } = { ...objectivProviderDefaultOptions, ...options };
  const objectivProviderPresent = useContext(ObjectivProviderContext);

  if (objectivProviderPresent) {
    console.error(`
      ｢objectiv｣ NavigationAwareObjectivProvider should not be nested and should be placed as high as possible in the Application. 
      To override Tracker and/or LocationStack, use TrackingContextProvider instead.
    `);
  }

  // TODO move to an actual plugin module
  tracker.plugins.plugins.push({
    console: tracker.console,
    pluginName: 'RootLocationAndPathContextsFromNavigation',
    enrich: (contexts) => {
      let rootLocationContextId = 'home';
      let pathContextId = '/';
      if (navigationContainerRef.isReady()) {
        const currentRouteName = navigationContainerRef.getCurrentRoute()?.name;
        rootLocationContextId = currentRouteName ?? 'home';
        pathContextId = getPathFromState(navigationContainerRef.getRootState());
      }
      contexts.location_stack.unshift(makeRootLocationContext({ id: rootLocationContextId }));
      contexts.global_contexts.push(makePathContext({ id: pathContextId }));
    },
    isUsable: () => true,
  });

  useOnMount(() => {
    if (trackApplicationLoaded && navigationContainerRef.isReady()) {
      trackApplicationLoadedEvent({ tracker });
    }
  });

  return (
    <ObjectivProviderContext.Provider value={true}>
      <TrackingContextProvider tracker={tracker}>
        {(trackingContext) => (typeof children === 'function' ? children(trackingContext) : children)}
      </TrackingContextProvider>
    </ObjectivProviderContext.Provider>
  );
}
