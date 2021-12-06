/*
 * Copyright 2021 Objectiv B.V.
 */

import { createContext } from 'react';
import { TrackerContextState, TrackerProviderProps } from '../types';

/**
 * A Context to retrieve a Tracker instance.
 * Components may retrieve their Tracker either via `useContext(TrackerContext)` or `useTracker()`.
 */
export const TrackerContext = createContext<null | TrackerContextState>(null);

/**
 * TrackerProvider wraps its children with TrackerContext.Provider. It's meant to be used as
 * high as possible in the Component tree. Children gain access to both the Tracker and their LocationStack.
 *
 * All LocationWrappers and `useTrack*` hooks require to be wrapped in TrackerProvider to function.
 *
 * @see LocationStackProvider
 * @see ObjectivProvider
 */
export const TrackerProvider = ({ children, tracker }: TrackerProviderProps) => (
  <TrackerContext.Provider value={{ tracker }}>
    {typeof children === 'function' ? children({ tracker }) : children}
  </TrackerContext.Provider>
);
