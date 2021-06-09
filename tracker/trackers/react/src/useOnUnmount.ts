import { useEffect } from 'react';

/**
 * A side effect that runs only once on unmount.
 */
export const useOnUnmount = (destructor: () => ReturnType<typeof useEffect>) => {
  useEffect(() => () => destructor(), []);
};
