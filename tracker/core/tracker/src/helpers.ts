/**
 * Generic decorator to extend Interfaces and ensure they will have a class constructor
 */
export type Newable<T> = { new (...args: Record<string, unknown>[]): T };
