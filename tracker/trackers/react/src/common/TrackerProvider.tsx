/*
 * Copyright 2021 Objectiv B.V.
 */

import { createContext, useContext } from 'react';
import { LocationStackEntry, TrackerContextState, TrackerProviderProps } from '../types';
import { LocationStackContext, LocationStackProvider } from './LocationStackProvider';

export const TrackerContext = createContext<null | TrackerContextState>(null);

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
