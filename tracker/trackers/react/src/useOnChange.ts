import { EffectCallback, useEffect, useRef } from 'react';

/**
 * A side effect that monitors the given `state` and runs only when it changes.
 */
export const useOnChange = <T = unknown>(state: T, effect: EffectCallback) => {
  let previousStateRef = useRef<T>();

  useEffect(() => {
    previousStateRef.current = state;
  });

  useEffect(() => {
    if (typeof previousStateRef.current !== 'undefined' && previousStateRef.current !== state) {
      effect();
    }
  }, [state]);
};
