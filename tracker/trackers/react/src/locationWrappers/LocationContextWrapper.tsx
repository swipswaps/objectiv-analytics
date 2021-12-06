/*
 * Copyright 2021 Objectiv B.V.
 */

import { LocationStackProvider } from '../common/LocationStackProvider';
import { useMakeLocationStackEntry } from '../hooks/useMakeLocationStackEntry';
import { useTracker } from '../hooks/useTracker';
import { LocationContextWrapperProps } from '../types';

/**
 * Wraps its children in the given LocationContext by factoring a new LocationStackEntry for the LocationStackProvider.
 */
export const LocationContextWrapper = ({ children, locationContext }: LocationContextWrapperProps) => {
  const tracker = useTracker();
  const locationStackEntry = useMakeLocationStackEntry(locationContext);

  return (
    <LocationStackProvider locationStackEntries={[locationStackEntry]}>
      {(locationStackContextState) =>
        typeof children === 'function' ? children({ tracker, ...locationStackContextState }) : children
      }
    </LocationStackProvider>
  );
};
