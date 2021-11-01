import { coerce, create, string, Struct } from 'superstruct';

/**
 * Struct stringifier for JSON Objects
 */
export const stringifyJson = <T = unknown>(object: T, struct: Struct<T>): string => {
  return create(
    object,
    coerce(string(), struct, (value) => JSON.stringify(value))
  );
};
