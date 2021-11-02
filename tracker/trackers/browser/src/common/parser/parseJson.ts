import { coerce, create, string, Struct } from 'superstruct';

/**
 * JSON Objects parser
 */
export const parseJson = <T = unknown>(stringifiedContext: string | null, struct: Struct<T>): T => {
  return create(
    stringifiedContext,
    coerce(struct, string(), (value) => JSON.parse(value))
  );
};
