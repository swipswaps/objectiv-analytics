/*
 * Copyright 2022 Objectiv B.V.
 */

import { makePathContext } from "@objectiv/tracker-core";
import { makeRootLocationContext, ObjectivProvider, ObjectivProviderProps } from '@objectiv/tracker-react-core';
import { ReactNativeTracker } from "@objectiv/tracker-react-native";
import { getPathFromState, NavigationContainerRefWithCurrent } from "@react-navigation/native";
import React, { useEffect } from 'react';

/**
 * NavigationAwareObjectivProvider requires an extra `navigationContainerRef` prop.
 */
export type NavigationAwareObjectivProviderProps<ParamList extends ReactNavigation.RootParamList> = ObjectivProviderProps & {
  navigationContainerRef: NavigationContainerRefWithCurrent<ParamList>
}

/**
 * An ObjectivProvider variant able to automatically infer RootLocationContext and PathContext from React Navigation.
 */
export function NavigationAwareObjectivProvider<ParamList extends ReactNavigation.RootParamList>({ children, tracker, navigationContainerRef, ...props }: NavigationAwareObjectivProviderProps<ParamList>) {
  const originalLocationStack = React.useRef(tracker.location_stack);
  const originalGlobalContexts = React.useRef(tracker.global_contexts);
  const [rootLocationContext, setRootLocationContext] = React.useState(makeRootLocationContext({ id: 'home' }));
  const [pathContext, setPathContext] = React.useState(makePathContext({ id: '/' }));

  const updateTrackerContexts = () => {
    if(navigationContainerRef.isReady()) {
      const currentRouteName = navigationContainerRef.getCurrentRoute()?.name;
      setRootLocationContext(makeRootLocationContext({ id: currentRouteName ?? 'home' }));
      setPathContext(makePathContext({id: getPathFromState(navigationContainerRef.getRootState())}));
    }
  }

  useEffect(() => {
    updateTrackerContexts();
    return navigationContainerRef.addListener('state', updateTrackerContexts);
  }, [])

  const enrichedTracker = new ReactNativeTracker(tracker, {
    location_stack: [rootLocationContext, ...originalLocationStack.current],
    global_contexts: [...originalGlobalContexts.current, pathContext]
  })

  return (
    <ObjectivProvider tracker={enrichedTracker} {...props}>
      {children}
    </ObjectivProvider>
  );
}

