import { boolean, coerce, create, define, literal, string, Struct, union, validate } from 'superstruct';
import { validate as validateUuid } from 'uuid';
import { LocationContext } from './Contexts';

/**
 * A custom Struct describing v4 UUIDs
 */
export const Uuid = define('Uuid', (value: any) => validateUuid(value));

/**
 * Generic structs to stringify and parse JSON via create + coerce
 */
export const stringifyStruct = <T = unknown>(object: T, struct: Struct<T>): string =>
  create(
    object,
    coerce(string(), struct, (value) => JSON.stringify(value))
  );

export const parseStruct = <T = unknown>(stringifiedContext: string | null, struct: Struct<T>): T =>
  create(
    stringifiedContext,
    coerce(struct, string(), (value) => JSON.parse(value))
  );

/**
 * Stringifier and Parser for Location Contexts
 */
export const stringifyLocationContext = (contextObject: LocationContext) => {
  return stringifyStruct(contextObject, LocationContext);
};

export const parseLocationContext = (stringifiedContext: string) => {
  return parseStruct(stringifiedContext, LocationContext);
};

/**
 * Custom Structs describing stringified booleans + their Stringifier and Parser
 */
export const StringBoolean = union([literal('true'), literal('false')]);

export const stringifyBoolean = (value: boolean) => {
  return create(JSON.stringify(value), StringBoolean);
};

export const parseBoolean = (stringifiedBoolean: string) => {
  validate(stringifiedBoolean, StringBoolean);
  return create(JSON.parse(stringifiedBoolean), boolean());
};
