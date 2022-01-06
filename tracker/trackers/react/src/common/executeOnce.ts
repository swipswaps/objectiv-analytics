/*
 * Copyright 2021-2022 Objectiv B.V.
 */

/**
 * High order function to execute the given function once
 */
export const executeOnce = (f: Function) => {
  let executed = false;
  return (...args: unknown[]) => {
    if (!executed) {
      executed = true;
      f(...args);
    }
  };
};
