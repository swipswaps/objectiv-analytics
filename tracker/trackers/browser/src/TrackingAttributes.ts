import { AbstractLocationContext } from '@objectiv/schema';
import { z } from "zod";

/**
 * The possible values of the `trackVisibility` TrackingAttribute.
 */
export const TrackingAttributeVisibilityAuto = z.object({ mode: z.literal('auto') });
export type TrackingAttributeVisibilityAuto = z.infer<typeof TrackingAttributeVisibilityAuto>;

export const TrackingAttributeVisibilityManual = z.object({ mode: z.literal('manual'), isVisible: z.boolean() });
export type TrackingAttributeVisibilityManual = z.infer<typeof TrackingAttributeVisibilityManual>;

export const TrackingAttributeVisibility = z.union([TrackingAttributeVisibilityAuto, TrackingAttributeVisibilityManual]);
export type TrackingAttributeVisibility = z.infer<typeof TrackingAttributeVisibility>;

/**
 * All the attributes that are added to a DOM Element to make it trackable
 */
export enum ElementTrackingAttribute {
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
}

/**
 * All the attributes that are added to a DOM Element that tracks its children via querySelector
 */
export enum ChildrenTrackingAttribute {
  // A list of serialized ChildTrackingQuery objects
  trackChildren = 'data-objectiv-track-children',
}

/**
 * The object that `track` calls return
 */
export type ElementTrackingAttributes = {
  [ElementTrackingAttribute.elementId]: string;
  [ElementTrackingAttribute.parentElementId]?: string;
  [ElementTrackingAttribute.context]: AbstractLocationContext;
  [ElementTrackingAttribute.trackClicks]?: boolean;
  [ElementTrackingAttribute.trackBlurs]?: boolean;
  [ElementTrackingAttribute.trackVisibility]?: TrackingAttributeVisibility;
};

/**
 * The object that `track` calls return, stringified
 */
export const StringifiedElementTrackingAttributes = z.object({
  [ElementTrackingAttribute.elementId]: z.string(),
  [ElementTrackingAttribute.parentElementId]: z.optional(z.string()),
  [ElementTrackingAttribute.context]: z.string(),
  [ElementTrackingAttribute.trackClicks]: z.optional(z.string()),
  [ElementTrackingAttribute.trackBlurs]: z.optional(z.string()),
  [ElementTrackingAttribute.trackVisibility]: z.optional(z.string()),
});
export type StringifiedElementTrackingAttributes = z.infer<typeof StringifiedElementTrackingAttributes>;

/**
 * The object that `trackChildren` calls return
 */
export type ChildrenTrackingAttributes = {
  [ChildrenTrackingAttribute.trackChildren]: string[];
};
