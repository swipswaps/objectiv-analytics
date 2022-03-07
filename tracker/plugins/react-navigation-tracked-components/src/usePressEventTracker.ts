/*
 * Copyright 2022 Objectiv B.V.
 */

import { makePathContext } from '@objectiv/tracker-core';
import { makeRootLocationContext, TrackingContext, trackPressEvent } from '@objectiv/tracker-react';
import { findFocusedRoute, useNavigation } from '@react-navigation/native';

/**
 * Returns a press event handler for React Navigation Link that automatically factors Path and RootLocation Contexts.
 */
export const usePressEventTracker = () => {
  const navigationState = useNavigation().getState();
  const currentRoute = findFocusedRoute(navigationState);
  const pathContext = makePathContext({ id: currentRoute?.path ?? '/' });
  const rootLocationContext = makeRootLocationContext({ id: currentRoute?.name ?? 'home' });

  return ({ tracker, locationStack }: TrackingContext) =>
    trackPressEvent({
      tracker,
      locationStack: [rootLocationContext, ...locationStack],
      globalContexts: [pathContext],
    });
};
