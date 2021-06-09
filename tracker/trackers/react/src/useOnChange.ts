import { EffectCallback, useEffect, useRef } from 'react';

/**
 * A side effect that monitors the given `state` and runs only when it changes.
 */
export const useOnChange = <T=unknown>(state: T, effect: EffectCallback) => {
  let previous = useRef<T>().current;

  useEffect(() => {
    previous = state;
  });

  useEffect(() => {
    if (typeof previous !== 'undefined' && state !== previous) {
      effect();
    }
  }, [state]);
};
