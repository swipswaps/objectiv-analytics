/*
 * Copyright 2022 Objectiv B.V.
 */

import { makePathContext } from '@objectiv/tracker-core';
import { findFocusedRoute, useNavigation } from '@react-navigation/native';

/**
 * This hook uses React Navigation APIs to factor a PathContext.
 */
export const usePathContextFromNavigationState = () => {
  const navigationState = useNavigation().getState();
  const currentRoute = findFocusedRoute(navigationState);

  return makePathContext({
    id: currentRoute?.path ?? '/',
  });
};
