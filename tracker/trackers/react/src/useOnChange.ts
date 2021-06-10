import { EffectCallback, useEffect, useRef } from 'react';
import isEqual from 'react-fast-compare';

/**
 * A side effect that monitors the given `state` and runs the given `effect` when it changes.
 */
export const useOnChange = <T = unknown>(state: T, effect: EffectCallback) => {
  let previousStateRef = useRef<T>(state);
  let latestEffectRef = useRef(effect);

  latestEffectRef.current = effect;

  useEffect(() => {
    if (!isEqual(previousStateRef.current, state)) {
      effect();
    }
  }, [state]);
};
