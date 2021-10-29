import { boolean, create, literal, union } from 'superstruct';

/**
 * Boolean struct
 */
export const StringBoolean = union([literal('true'), literal('false')]);

/**
 * Struct Stringifier and Parser for Booleans
 */
export const stringifyBoolean = (value: boolean) => {
  return create(JSON.stringify(value), StringBoolean);
};

export const parseBoolean = (stringifiedBoolean: string | null) => {
  if (stringifiedBoolean === null) {
    throw new Error('Received `null` while attempting to parse boolean');
  }
  return create(JSON.parse(stringifiedBoolean), boolean());
};
