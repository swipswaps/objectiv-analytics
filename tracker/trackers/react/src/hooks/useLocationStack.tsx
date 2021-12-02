/*
 * Copyright 2021 Objectiv B.V.
 */

import { useContext } from 'react';
import { LocationStackContext } from '../common/LocationStackProvider';

export const useLocationStack = () => {
  const locationStackContext = useContext(LocationStackContext);

  if (!locationStackContext) {
    throw new Error(`Couldn't get a LocationStack. Is the Component in a LocationStackProvider or TrackerProvider?`);
  }

  // Return a clone of the actual Location Stack to safeguard against mutations
  return [...locationStackContext.locationStack];
};
