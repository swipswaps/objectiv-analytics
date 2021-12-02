/*
 * Copyright 2021 Objectiv B.V.
 */

import { useLocationStack } from './useLocationStack';

export const useParentLocation = () => {
  const locationStack = useLocationStack();

  if (!locationStack.length) {
    return null;
  }

  const [parentLocation] = locationStack.reverse();

  return parentLocation;
};
