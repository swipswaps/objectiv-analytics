import { TrackingAttribute, TrackingAttributes } from './TrackingAttributes';

/**
 * A Trackable Element is an HTMLElement or an SVGElement
 */
export type TrackableElement = HTMLElement | SVGElement;

/**
 * A type guard to determine if a the given Element is an HTMLElement or SVGElement
 */
export const isTrackableElement = (element: Element | Node | EventTarget | null): element is TrackableElement =>
  element instanceof HTMLElement || element instanceof SVGElement;

/**
 * A Tracked Element is an TrackableElement with our TrackingAttributes
 */
export type TrackedElement = TrackableElement & { dataset: TrackingAttributes };

/**
 * A type guard to determine if a the given Element is an HTMLElement or SVGElement with essential TrackingAttributes
 */
export const isTrackedElement = (element: Element | Node | EventTarget | null): element is TrackedElement =>
  isTrackableElement(element) &&
  element.hasAttribute(TrackingAttribute.elementId) &&
  element.hasAttribute(TrackingAttribute.context);
