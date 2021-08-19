import { isTrackedElement } from './isTrackedElement';
import { TrackingAttributes } from './TrackingAttributes';

/**
 * Walk the DOM upwards looking for Tracked Elements. The resulting array can be used to reconstruct a Location Stack.
 */
export const findTrackedElementsInDOM = (
  element: Element | null,
  parentElements: TrackingAttributes[] = []
): TrackingAttributes[] => {
  if (!element) {
    return parentElements;
  }
  if (isTrackedElement(element)) {
    parentElements.push(element.dataset);
  }
  return findTrackedElementsInDOM(element.parentElement, parentElements);
};
