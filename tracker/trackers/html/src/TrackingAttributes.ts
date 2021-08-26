/**
 * The possible values of the `trackVisibility` TrackingAttribute.
 */
export type TrackingAttributeVisibilityAuto = { mode: 'auto' };
export type TrackingAttributeVisibilityManual = { mode: 'manual'; isVisible: boolean };
export type TrackingAttributeVisibility = TrackingAttributeVisibilityAuto | TrackingAttributeVisibilityManual;

/**
 * Common tracking attributes used by all types of tracked elements
 */
export enum TrackingAttribute {
  // A unique identifier used internally to pinpoint to a specific instance of a tracked element
  elementId = 'data-objectiv-element-id',
}

/**
 * All the attributes that are added to a DOM Element to make it trackable
 */
export enum ElementTrackingAttribute {
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
  queries = 'data-objectiv-queries',
}

/**
 * The object that `track` calls return
 */
export type ElementTrackingAttributes = {
  [TrackingAttribute.elementId]: string;
  [ElementTrackingAttribute.context]: string;
  [ElementTrackingAttribute.trackClicks]?: boolean;
  [ElementTrackingAttribute.trackBlurs]?: boolean;
  [ElementTrackingAttribute.trackVisibility]?: TrackingAttributeVisibility;
};

/**
 * The object representing a querySelector expression and the attributes that will be applied to the matching Element
 */
export type ChildTrackingQuery = {
  // A querySelector expression
  query: string;

  // The attributes
  elementTrackingAttributes: ElementTrackingAttributes;
};

/**
 * The object that `trackChildren` calls return
 */
export type ChildrenTrackingAttributes = {
  [TrackingAttribute.elementId]: string;
  [ChildrenTrackingAttribute.queries]: ChildTrackingQuery[];
};
