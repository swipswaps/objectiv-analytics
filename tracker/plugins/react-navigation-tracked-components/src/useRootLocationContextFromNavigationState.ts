/*
 * Copyright 2022 Objectiv B.V.
 */

import { makeRootLocationContext } from '@objectiv/tracker-react';
import { findFocusedRoute, useNavigation } from '@react-navigation/native';

/**
 * This hook uses React Navigation APIs to factor a RootLocationContext.
 */
export const useRootLocationContextFromNavigation = () => {
  const navigationState = useNavigation().getState();
  const currentRoute = findFocusedRoute(navigationState);

  return makeRootLocationContext({
    id: currentRoute?.name ?? 'home',
  });
};
