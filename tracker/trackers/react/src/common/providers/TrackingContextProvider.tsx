/*
 * Copyright 2021 Objectiv B.V.
 */

import { TrackingContextProviderProps } from '../../types';
import { LocationProvider } from './LocationProvider';
import { TrackerProvider } from './TrackerProvider';

/**
 * TrackingContextProvider wraps its children with TrackerProvider and LocationProvider.
 */
export const TrackingContextProvider = ({ children, tracker, locationEntries }: TrackingContextProviderProps) => (
  <TrackerProvider tracker={tracker}>
    <LocationProvider locationEntries={locationEntries ?? []}>
      {(locationProviderContextState) =>
        typeof children === 'function' ? children({ tracker, ...locationProviderContextState }) : children
      }
    </LocationProvider>
  </TrackerProvider>
);
