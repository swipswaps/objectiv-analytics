/*
 * Copyright 2021 Objectiv B.V.
 */

import { createContext, useContext } from 'react';
import { LocationStackContextState, LocationStackProviderProps } from '../types';

export const LocationStackContext = createContext<null | LocationStackContextState>(null);

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
