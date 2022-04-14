/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { createContext } from 'react';
import { LocationStack } from '../../types';

/**
 * LocationProviderContext state holds a LocationStack of LocationContexts.
 */
export type LocationProviderContext = {
  /**
   * An array of AbstractLocationContext objects.
   */
  locationStack: LocationStack;
};

/**
 * A Context to retrieve a LocationStack.
 * Components may access Context state either via `useContext(LocationProviderContext)` or `useLocationStack()`.
 */
export const LocationProviderContext = createContext<null | LocationProviderContext>(null);
