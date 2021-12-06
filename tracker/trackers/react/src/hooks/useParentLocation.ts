/*
 * Copyright 2021 Objectiv B.V.
 */

import { useLocationStackEntries } from './useLocationStackEntries';

/**
 * A utility hook to retrieve the parent LocationStackEntry. Returns `null` if there is no parent.
 */
export const useParentLocation = () => {
  const locationStack = useLocationStackEntries();

  if (!locationStack.length) {
    return null;
  }

  const [parentLocation] = locationStack.reverse();

  return parentLocation;
};
