/**
 * All the attributes that are added to a DOM Element to make it trackable
 */
export enum TrackingAttribute {
  // A unique identifier used internally to pinpoint to a specific instance of a tracked element
  elementId = 'data-objectiv-element-id',

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
 * Explicit literal types and constants for booleans in our Tracking Attributes
 */
export type TrackingAttributeTrue = 'true';
export type TrackingAttributeFalse = 'false';
export type TrackingAttributeBoolean = TrackingAttributeTrue | TrackingAttributeFalse;
export const TrackingAttributeTrue: TrackingAttributeTrue = 'true';
export const TrackingAttributeFalse: TrackingAttributeFalse = 'false';

/**
 * The possible values of the `trackVisibility` TrackingAttribute.
 */
export type TrackingAttributeVisibility = undefined | { mode: 'auto' } | { mode: 'manual'; isVisible: boolean };

/**
 * The object that `trackElement` call return, containing all Tracking Attributes.
 */
export type TrackingAttributes = {
  [TrackingAttribute.elementId]: string;
  [TrackingAttribute.context]: string;
  [TrackingAttribute.trackClicks]: TrackingAttributeBoolean;
  [TrackingAttribute.trackBlurs]: TrackingAttributeBoolean;
  [TrackingAttribute.trackVisibility]: TrackingAttributeVisibility;
};
