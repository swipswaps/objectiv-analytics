/*
 * Copyright 2021 Objectiv B.V.
 */

import { createContext, useContext } from 'react';
import { LocationProviderContextState, LocationProviderProps } from '../../types';

/**
 * A Context to retrieve LocationEntries and LocationStack.
 * Components may access Context state either via `useContext(LocationProviderContext)` or `useLocationEntries()`
 * or `useLocationStack()`.
 */
export const LocationProviderContext = createContext<null | LocationProviderContextState>(null);

/**
 * LocationProvider inherits the LocationStack from its parent LocationProvider and adds its own Location
 * Contexts to it, effectively extending the stack with one or more LocationEntries.
 */
export const LocationProvider = ({ children, locationEntries }: LocationProviderProps) => {
  const locationProviderContext = useContext(LocationProviderContext);
  const existingLocationEntries = locationProviderContext?.locationEntries ?? [];
  const newLocationEntries = [...existingLocationEntries, ...locationEntries];
  const newLocationProviderContextState: LocationProviderContextState = {
    locationEntries: newLocationEntries,
    locationStack: newLocationEntries.map((locationEntry) => locationEntry.locationContext),
  };

  return (
    <LocationProviderContext.Provider value={newLocationProviderContextState}>
      {typeof children === 'function' ? children(newLocationProviderContextState) : children}
    </LocationProviderContext.Provider>
  );
};
