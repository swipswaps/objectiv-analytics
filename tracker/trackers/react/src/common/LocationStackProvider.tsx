/*
 * Copyright 2021 Objectiv B.V.
 */

import { createContext, useContext } from 'react';
import { LocationStackContextState, LocationStackProviderProps } from '../types';

/**
 * A Context to retrieve a LocationStack.
 * Components may retrieve their LocationStack either via `useContext(LocationStackContext)` or `useLocationStack()`.
 */
export const LocationStackContext = createContext<null | LocationStackContextState>(null);

/**
 * LocationStackProvider inherits the LocationStack from its parent LocationStackProvider and adds its own Location
 * Contexts to it, effectively extending the stack with one or more LocationStackEntries.
 */
export const LocationStackProvider = ({ children, locationStack }: LocationStackProviderProps) => {
  const locationStackContext = useContext(LocationStackContext);
  const existingLocationStack = locationStackContext?.locationStack ?? [];
  const newLocationStackContextState = { locationStack: [...existingLocationStack, ...locationStack] };

  return (
    <LocationStackContext.Provider value={newLocationStackContextState}>
      {typeof children === 'function' ? children(newLocationStackContextState) : children}
    </LocationStackContext.Provider>
  );
};
