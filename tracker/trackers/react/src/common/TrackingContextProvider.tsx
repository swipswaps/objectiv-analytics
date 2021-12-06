/*
 * Copyright 2021 Objectiv B.V.
 */

import { useContext } from 'react';
import { LocationEntry, TrackerProviderProps } from '../types';
import { LocationProvider, LocationProviderContext } from './LocationProvider';
import { TrackerProvider } from './TrackerProvider';

/**
 * TrackingContextProvider wraps its children with TrackerProvider and LocationProvider.
 */
export const TrackingContextProvider = ({ children, tracker }: TrackerProviderProps) => {
  const locationProviderContext = useContext(LocationProviderContext);
  const locationEntries: LocationEntry[] = locationProviderContext?.locationEntries ?? [];

  return (
    <TrackerProvider tracker={tracker}>
      <LocationProvider locationEntries={locationEntries}>
        {(locationProviderContextState) =>
          typeof children === 'function' ? children({ tracker, ...locationProviderContextState }) : children
        }
      </LocationProvider>
    </TrackerProvider>
  );
};
