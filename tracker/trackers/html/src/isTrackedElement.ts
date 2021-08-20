/**
 * A Tracked Element is an HTMLElement with Tracking Attributes
 */
import { TrackingAttribute, TrackingAttributes } from './TrackingAttributes';

export type TrackedElement = HTMLElement & { dataset: TrackingAttributes };

/**
 * A type guard to determine if a the given Element is an HTMLElement with essential Tracking Attributes
 */
export const isTrackedElement = (element: Element | Node | EventTarget | null): element is TrackedElement =>
  element instanceof HTMLElement &&
  element.hasAttribute(TrackingAttribute.objectivElementId) &&
  element.hasAttribute(TrackingAttribute.objectivContext);
