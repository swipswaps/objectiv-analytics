import { array, boolean, defaulted, define, Infer, is, literal, object, optional, string, union } from 'superstruct';
import { v4, validate } from 'uuid';
import { LocationContext } from './Contexts';

/**
 * The possible values of the `trackVisibility` TrackingAttribute.
 */
export const TrackingAttributeVisibilityAuto = object({ mode: literal('auto') });
export type TrackingAttributeVisibilityAuto = Infer<typeof TrackingAttributeVisibilityAuto>;

export const TrackingAttributeVisibilityManual = object({ mode: literal('manual'), isVisible: boolean() });
export type TrackingAttributeVisibilityManual = Infer<typeof TrackingAttributeVisibilityManual>;

export const TrackingAttributeVisibility = union([TrackingAttributeVisibilityAuto, TrackingAttributeVisibilityManual]);
export type TrackingAttributeVisibility = Infer<typeof TrackingAttributeVisibility>;

/**
 * All the attributes that are added to a DOM Element to make it trackable
 */
export enum TrackingAttribute {
  // A unique identifier used internally to pinpoint to a specific instance of a tracked element
  elementId = 'data-objectiv-element-id',

  // DOM traversing to rebuild Locations is not always possible, eg: Portals. This allows specifying a parent Element.
  parentElementId = 'data-objectiv-parent-element-id',

  // A serialized instance of an Objectiv Context
  context = 'data-objectiv-context',

  // Track click events for this tracked element
  trackClicks = 'data-objectiv-track-clicks',

  // Track blur events for this tracked element
  trackBlurs = 'data-objectiv-track-blurs',

  // Determines how we will track visibility events for this tracked element.
  trackVisibility = 'data-objectiv-track-visibility',

  // A list of serialized ChildTrackingQuery objects
  trackChildren = 'data-objectiv-track-children',
}

/**
 * A custom Struct describing v4 UUIDs
 */
export const Uuid = define('Uuid', (value: any) => validate(value));

/**
 * Custom Structs describing stringified booleans
 */
export const StringTrue = define('StringTrue', (value) => value === 'true');
export const StringFalse = define('StringFalse', (value) => value === 'false');
export const StringBoolean = define('StringBoolean', (value) => is(value, union([StringTrue, StringFalse])));

/**
 * The object that `track` calls return
 */
export const TrackingAttributes = object({
  [TrackingAttribute.elementId]: Uuid,
  [TrackingAttribute.parentElementId]: optional(Uuid),
  [TrackingAttribute.context]: LocationContext,
  [TrackingAttribute.trackClicks]: optional(boolean()),
  [TrackingAttribute.trackBlurs]: optional(boolean()),
  [TrackingAttribute.trackVisibility]: optional(TrackingAttributeVisibility),
});
export type TrackingAttributes = Infer<typeof TrackingAttributes>;

/**
 * The object that `track` calls return, stringified
 */
export const StringifiedTrackingAttributes = object({
  [TrackingAttribute.elementId]: defaulted(Uuid, () => v4()),
  [TrackingAttribute.parentElementId]: optional(Uuid),
  [TrackingAttribute.context]: string(),
  [TrackingAttribute.trackClicks]: optional(StringBoolean),
  [TrackingAttribute.trackBlurs]: optional(StringBoolean),
  [TrackingAttribute.trackVisibility]: optional(string()),
});
export type StringifiedTrackingAttributes = Infer<typeof StringifiedTrackingAttributes>;

/**
 * The object that `trackChildren` calls return
 */
export const TrackChildrenQueryOne = object({
  query: string(),
  queryAll: literal(undefined),
});
export type TrackChildrenQueryOne = Infer<typeof TrackChildrenQueryOne>;

export const TrackChildrenQueryAll = object({
  query: literal(undefined),
  queryAll: string(),
});
export type TrackChildrenQueryAll = Infer<typeof TrackChildrenQueryAll>;

export const TrackChildrenQuery = union([TrackChildrenQueryOne, TrackChildrenQueryAll]);
export type TrackChildrenQuery = Infer<typeof TrackChildrenQuery>;

export const ChildrenTrackingAttributes = object({
  [TrackingAttribute.trackChildren]: array(TrackChildrenQuery),
});
export type ChildrenTrackingAttributes = Infer<typeof ChildrenTrackingAttributes>;

/**
 * The object that `trackChildren` calls return, stringified
 */
export const StringifiedChildrenTrackingAttributes = object({
  [TrackingAttribute.trackChildren]: string(),
});
export type StringifiedChildrenTrackingAttributes = Infer<typeof StringifiedChildrenTrackingAttributes>;
