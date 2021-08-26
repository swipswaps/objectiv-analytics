import {
  ChildrenTrackingAttribute,
  ChildrenTrackingAttributes,
  ElementTrackingAttribute,
  ElementTrackingAttributes,
} from './TrackingAttributes';

/**
 * The type of Elements the type guards can work with
 */
export type GuardElement = Element | Node | EventTarget | null;

/**
 * A Trackable Element is an HTMLElement or an SVGElement
 */
export type TrackableElement = HTMLElement | SVGElement;

/**
 * A type guard to determine if a the given Element is an HTMLElement or SVGElement.
 * In general we can only track Elements supporting dataset attributes.
 */
export const isTrackableElement = (element: GuardElement): element is TrackableElement =>
  element instanceof HTMLElement || element instanceof SVGElement;

/**
 * A Tracked Element is a TrackableElement with our TrackingAttributes
 */
export type TrackedElement = TrackableElement & { dataset: ElementTrackingAttributes };

/**
 * A type guard to determine if the given Element is a TrackableElement decorated with TrackingAttributes.
 * Note: For performance and simplicity we only check if `context` is present. Assume all other attributes are there.
 */
export const isTrackedElement = (element: GuardElement): element is TrackedElement =>
  isTrackableElement(element) && element.hasAttribute(ElementTrackingAttribute.context);

/**
 * A Children Tracking Element is a TrackableElement with our ChildrenTrackingAttributes
 */
export type ChildrenTrackingElement = TrackableElement & { dataset: ChildrenTrackingAttributes };

/**
 * A type guard to determine if the given Element is a TrackableElement decorated with ChildrenTrackingAttributes.
 */
export const isChildrenTrackingElement = (element: GuardElement): element is ChildrenTrackingElement =>
  isTrackableElement(element) && element.hasAttribute(ChildrenTrackingAttribute.queries);
