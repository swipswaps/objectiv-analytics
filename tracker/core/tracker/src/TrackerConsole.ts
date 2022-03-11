/*
 * Copyright 2021-2022 Objectiv B.V.
 */

/**
 * A subset of the Console interface methods.
 */
export type TrackerConsoleImplementation = Pick<
  Console,
  'debug' | 'error' | 'group' | 'groupCollapsed' | 'groupEnd' | 'info' | 'log' | 'warn'
>;

/**
 * TrackerConsole is a simplified implementation of Console.
 */
export type TrackerConsole = TrackerConsoleImplementation & {
  implementation: TrackerConsoleImplementation;
  setImplementation: (implementation: TrackerConsoleImplementation) => void;
};

/**
 * The default implementation of TrackerConsole. A singleton used pretty much by all other interfaces.
 */
export const TrackerConsole: TrackerConsole = {
  implementation: console,
  setImplementation: (implementation: TrackerConsoleImplementation) => (TrackerConsole.implementation = implementation),
  debug: (...args: any[]) => TrackerConsole.implementation.debug(...args),
  error: (...args: any[]) => TrackerConsole.implementation.error(...args),
  group: (...args: any[]) => TrackerConsole.implementation.group(...args),
  groupCollapsed: (...args: any[]) => TrackerConsole.implementation.groupCollapsed(...args),
  groupEnd: () => TrackerConsole.implementation.groupEnd(),
  info: (...args: any[]) => TrackerConsole.implementation.info(...args),
  log: (...args: any[]) => TrackerConsole.implementation.log(...args),
  warn: (...args: any[]) => TrackerConsole.implementation.warn(...args),
};
