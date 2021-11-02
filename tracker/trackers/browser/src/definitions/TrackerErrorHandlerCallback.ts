/**
 * Generic onError callback definition used by `trackerErrorHandler`.
 */
export type TrackerErrorHandlerCallback = <T = unknown>(error: unknown, parameters?: T) => void;
