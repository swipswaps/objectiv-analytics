import { DiscriminatingPropertyPrefix } from "@objectiv/schema";
import { v4 as uuidv4 } from 'uuid';

/**
 * Generic decorator to extend Interfaces and ensure they will have a class constructor
 */
export type Newable<T> = { new (...args: Record<string, unknown>[]): T };

/**
 * A more flexible implementation of Partial that allows to specify which properties should be Partial
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * A TypeScript friendly Object.keys
 */
export const getObjectKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;

/**
 * A TypeScript generic describing an array with at least one item of the given Type
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * A TypeScript NonEmptyArray guard
 */
export function isNonEmptyArray<T>(array: T[]): array is [T, ...T[]] {
  return array.length > 0;
}

/**
 * A UUID v4 generator
 */
export const generateUUID = () => uuidv4();


/**
 * Used to clean our Object instances from TS discriminating artifact properties
 */
export const cleanObjectFromDiscriminatingProperties = <T extends object>(obj: T) => {
  // All discriminating properties start with this prefix
  const DISCRIMINATING_PROPERTY_PREFIX: DiscriminatingPropertyPrefix = '__';

  getObjectKeys(obj).forEach((propertyName) => {
    if (propertyName.toString().startsWith(DISCRIMINATING_PROPERTY_PREFIX)) {
      delete obj[propertyName];
    }
  });
};