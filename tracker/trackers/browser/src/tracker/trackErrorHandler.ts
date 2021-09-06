/**
 * Generic onError callback, parameter and error handler for track functions.
 * Allows developers to provide an onError callback to handle errors themselves.
 * Default behavior is to console.error.
 */
export type TrackOnErrorCallback = <T = unknown>(error: Error, parameters?: T) => void;

export const trackErrorHandler = (error: Error, parameters?: unknown, onError?: TrackOnErrorCallback) => {
  if (onError) {
    onError(error);
  } else {
    console.error(error, parameters);
  }
  return undefined;
};
