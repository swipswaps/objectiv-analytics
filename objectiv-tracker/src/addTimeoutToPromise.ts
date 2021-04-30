export function addTimeoutToPromise<T>(promise: Promise<T>, timeout: number) {
  let timeoutId: number;

  return new Promise((resolve, reject) => {
    // TODO decouple from window. Use nodejs native setTimeout or timers library or custom implementation
    timeoutId = window.setTimeout(() => reject(new Error('timeout')), timeout);
    promise
      .then((...args) => {
        clearTimeout(timeoutId);
        resolve(...args);
      })
      .catch((error) => reject(error));
  });
}
