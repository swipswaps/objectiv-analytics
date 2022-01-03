/*
 * Copyright 2022 Objectiv B.V.
 */

import { coerce, create, string, Struct } from 'superstruct';

/**
 * JSON Objects parser
 */
export const parseJson = <T = unknown>(stringifiedObject: string | null, struct: Struct<T>): T => {
  return create(
    stringifiedObject,
    coerce(struct, string(), (value) => JSON.parse(value))
  );
};
