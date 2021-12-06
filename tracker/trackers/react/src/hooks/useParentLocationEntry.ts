/*
 * Copyright 2021 Objectiv B.V.
 */

import { useLocationEntries } from './useLocationEntries';

/**
 * A utility hook to retrieve the parent LocationEntry. Returns `null` if there is no parent.
 */
export const useParentLocationEntry = () => {
  const locationEntries = useLocationEntries();

  if (!locationEntries.length) {
    return null;
  }

  const [parentLocationEntry] = locationEntries.reverse();

  return parentLocationEntry;
};
