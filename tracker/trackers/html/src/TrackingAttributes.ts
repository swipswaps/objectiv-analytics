/**
 * All the attributes that are added to a DOM Element to make it trackable
 */
export enum TrackingAttribute {
  // A unique identifier used internally to pinpoint to a specific instance of a tracked element
  objectivElementId = 'data-objectiv-element-id',

  // A serialized instance of an Objectiv Context
  objectivContext = 'data-objectiv-context',

  // Track click events for this tracked element
  objectivTrackClicks = 'data-objectiv-track-clicks',

  // Track blur events for this tracked element
  objectivTrackBlurs = 'data-objectiv-track-blurs',

  // Indicates visibility of the element, defaults to true
  objectivVisible = 'data-objectiv-visible',
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
 * The object that `trackElement` call return, containing all Tracking Attributes.
 */
export type TrackingAttributes = {
  [TrackingAttribute.objectivElementId]: string;
  [TrackingAttribute.objectivContext]: string;
  [TrackingAttribute.objectivTrackClicks]: TrackingAttributeBoolean;
  [TrackingAttribute.objectivTrackBlurs]: TrackingAttributeBoolean;
  [TrackingAttribute.objectivVisible]: TrackingAttributeBoolean;
};
