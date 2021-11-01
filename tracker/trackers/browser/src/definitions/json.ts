import { coerce, create, string, Struct } from 'superstruct';

/**
 * Struct stringifier and parser for JSON Objects
 */
export const jsonStringify = <T = unknown>(object: T, struct: Struct<T>): string => {
  return create(
    object,
    coerce(string(), struct, (value) => JSON.stringify(value))
  );
};

export const jsonParse = <T = unknown>(stringifiedContext: string | null, struct: Struct<T>): T => {
  return create(
    stringifiedContext,
    coerce(struct, string(), (value) => JSON.parse(value))
  );
};
