/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { useEffect, useRef } from 'react';
import isEqual from 'fast-deep-equal';
import { OnChangeEffectCallback } from '../types';

/**
 * A side effect that monitors the given `state` and runs the given `effect` when it changes.
 */
export const useOnChange = <T>(state: T, effect: OnChangeEffectCallback<T>) => {
  let previousStateRef = useRef<T>(state);
  let latestEffectRef = useRef(effect);

  latestEffectRef.current = effect;

  useEffect(() => {
    if (!isEqual(previousStateRef.current, state)) {
      effect(previousStateRef.current, state);
      previousStateRef.current = state;
    }
  }, [state]);
};
