import { useEffect } from 'react';

/**
 * A useEffect Destructor
 */
export type EffectDestructor = () => ReturnType<typeof useEffect>;

/**
 * A side effect that runs only once on unmount.
 */
export const useOnUnmount = (destructor: EffectDestructor) => useEffect(() => () => destructor(), []);
