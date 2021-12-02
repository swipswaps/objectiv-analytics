/*
 * Copyright 2021 Objectiv B.V.
 */

import { LocationStackProvider } from '../common/LocationStackProvider';
import { useMakeLocationStackEntry } from '../hooks/useMakeLocationStackEntry';
import { LocationContextWrapperProps } from '../types';

export const LocationContextWrapper = ({ children, locationContext }: LocationContextWrapperProps) => {
  const locationStackEntry = useMakeLocationStackEntry(locationContext);

  return <LocationStackProvider locationStack={[locationStackEntry]}>{children}</LocationStackProvider>;
};
