import { coerce, create, string, Struct } from 'superstruct';

/**
 * JSON Objects stringifier
 */
export const stringifyJson = <T = unknown>(object: T, struct: Struct<T>): string => {
  return create(
    object,
    coerce(string(), struct, (value) => JSON.stringify(value))
  );
};
