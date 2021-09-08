import { array, boolean, defaulted, Infer, object, optional, string } from 'superstruct';
import { v4 } from 'uuid';
import { LocationContext } from './Contexts';
import { StringBoolean, TrackingAttributeVisibility, Uuid } from './structs';

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
export const TrackChildrenQuery = object({
  queryAll: string(),
  trackAs: optional(StringifiedTrackingAttributes),
});
export const ValidTrackChildrenQuery = object({
  queryAll: string(),
  trackAs: StringifiedTrackingAttributes,
});
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
