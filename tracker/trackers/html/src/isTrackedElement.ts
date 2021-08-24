/**
 * A Tracked Element is an HTMLElement with Tracking Attributes
 */
import { TrackingAttribute, TrackingAttributes } from './TrackingAttributes';

export type TrackableElement = HTMLElement & { dataset: TrackingAttributes };

/**
 * A type guard to determine if a the given Element is an HTMLElement with essential Tracking Attributes
 */
export const isTrackableElement = (element: Element | Node | EventTarget | null): element is TrackableElement =>
  element instanceof HTMLElement || element instanceof SVGElement;

/**
 * A type guard to determine if a the given Element is an HTMLElement with essential Tracking Attributes
 */
export const isTrackedElement = (element: Element | Node | EventTarget | null): element is TrackableElement =>
  isTrackableElement(element) &&
  element.hasAttribute(TrackingAttribute.elementId) &&
  element.hasAttribute(TrackingAttribute.context);
