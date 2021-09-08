import {
  array,
  assert,
  boolean,
  coerce,
  create,
  define,
  Infer,
  literal,
  object,
  string,
  Struct,
  union,
} from 'superstruct';
import { validate as validateUuid } from 'uuid';
import { LocationContext } from './Contexts';
import { TrackChildrenParameters } from './tracker/trackChildren';
import { ValidTrackChildrenQuery } from './TrackingAttributes';

/**
 * A custom Struct describing v4 UUIDs
 */
export const Uuid = define('Uuid', (value: any) => validateUuid(value));

/**
 * Generic structs to stringify and parse JSON via create + coerce
 */
export const stringifyStruct = <T = unknown>(object: T, struct: Struct<T>): string => {
  return create(
    object,
    coerce(string(), struct, (value) => JSON.stringify(value))
  );
};

export const parseStruct = <T = unknown>(stringifiedContext: string | null, struct: Struct<T>): T => {
  return create(
    stringifiedContext,
    coerce(struct, string(), (value) => JSON.parse(value))
  );
};

/**
 * Stringifier and Parser for Location Contexts
 */
export const stringifyLocationContext = (contextObject: LocationContext) => {
  return stringifyStruct(contextObject, LocationContext);
};

export const parseLocationContext = (stringifiedContext: string | null) => {
  return parseStruct(stringifiedContext, LocationContext);
};

/**
 * Custom Structs describing stringified booleans + their Stringifier and Parser
 */
export const StringBoolean = union([literal('true'), literal('false')]);

export const stringifyBoolean = (value: boolean) => {
  return create(JSON.stringify(value), StringBoolean);
};

export const parseBoolean = (stringifiedBoolean: string | null) => {
  if (stringifiedBoolean === null) {
    throw new Error('Received `null` while attempting to parse boolean');
  }
  return create(JSON.parse(stringifiedBoolean), boolean());
};

/**
 * Custom Structs for the Visibility Tracking Attribute + their Stringifier and Parser
 */
export const TrackingAttributeVisibilityAuto = object({ mode: literal('auto') });
export type TrackingAttributeVisibilityAuto = Infer<typeof TrackingAttributeVisibilityAuto>;
export const TrackingAttributeVisibilityManual = object({ mode: literal('manual'), isVisible: boolean() });
export type TrackingAttributeVisibilityManual = Infer<typeof TrackingAttributeVisibilityManual>;
export const TrackingAttributeVisibility = union([TrackingAttributeVisibilityAuto, TrackingAttributeVisibilityManual]);
export type TrackingAttributeVisibility = Infer<typeof TrackingAttributeVisibility>;

export const stringifyVisibilityAttribute = (visibility: TrackingAttributeVisibility) => {
  if (!(typeof visibility === 'object')) {
    throw new Error(`Visibility must be an object, received: ${JSON.stringify(visibility)}`);
  }
  return stringifyStruct(visibility, TrackingAttributeVisibility);
};

export const parseVisibilityAttribute = (stringifiedVisibility: string | null) => {
  return parseStruct(stringifiedVisibility, TrackingAttributeVisibility);
};

/**
 * Children Tracking Attribute Stringifier and Parser
 */
export const stringifyChildrenAttribute = (queries: TrackChildrenParameters) => {
  if (!(typeof queries === 'object')) {
    throw new Error(`Visibility must be an object, received: ${JSON.stringify(queries)}`);
  }
  queries.forEach((query) => assert(query, ValidTrackChildrenQuery));
  return create(JSON.stringify(queries), string());
};

export const parseChildrenAttribute = (stringifiedChildrenAttribute: string | null) => {
  if (stringifiedChildrenAttribute === null) {
    throw new Error('Received `null` while attempting to parse children tracking attribute');
  }

  const queries = create(JSON.parse(stringifiedChildrenAttribute), TrackChildrenParameters);
  return create(queries, array(ValidTrackChildrenQuery));
};
