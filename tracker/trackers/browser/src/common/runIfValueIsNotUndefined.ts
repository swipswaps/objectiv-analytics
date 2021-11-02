/**
 * Executes `functionToRun(value)` only if the `value` is not `undefined`
 */
export const runIfValueIsNotUndefined = (functionToRun: Function, value: unknown) => {
  if (typeof value === 'undefined') {
    return undefined;
  }

  return functionToRun(value);
};
