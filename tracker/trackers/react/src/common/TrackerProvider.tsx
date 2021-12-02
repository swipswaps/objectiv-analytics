/*
 * Copyright 2021 Objectiv B.V.
 */

import { createContext, useContext } from 'react';
import { LocationStackEntry, TrackerContextState, TrackerProviderProps } from '../types';
import { LocationStackContext, LocationStackProvider } from './LocationStackProvider';

/**
 * A Context to retrieve a Tracker instance.
 * Components may retrieve their Tracker either via `useContext(TrackerContext)` or `useTracker()`.
 */
export const TrackerContext = createContext<null | TrackerContextState>(null);

/**
 * TrackerProvider wraps its children with TrackerContext.Provider and LocationStackProvider. It's meant to be used as
 * high as possible in the Component tree. Children gain access to both the Tracker and their LocationStack.
 *
 * All LocationWrappers and `useTrackOn*` hooks require to be wrapped in TrackerProvider to function.
 */
export const TrackerProvider = ({ children, tracker }: TrackerProviderProps) => {
  const locationStackContext = useContext(LocationStackContext);
  const locationStack: LocationStackEntry[] = locationStackContext?.locationStack ?? [];

  return (
    <TrackerContext.Provider value={{ tracker }}>
      <LocationStackProvider locationStack={locationStack}>
        {typeof children === 'function' ? children({ tracker, locationStack }) : children}
      </LocationStackProvider>
    </TrackerContext.Provider>
  );
};
