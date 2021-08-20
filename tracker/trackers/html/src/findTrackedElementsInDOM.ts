import { isTrackedElement } from './isTrackedElement';

/**
 * Walk the DOM upwards looking for Tracked Elements. The resulting array can be used to reconstruct a Location Stack.
 */
export const findTrackedElementsInDOM = (
  element: HTMLElement | null,
  parentElements: HTMLElement[] = []
): HTMLElement[] => {
  if (!element) {
    return parentElements;
  }
  if (isTrackedElement(element)) {
    parentElements.push(element);
  }
  return findTrackedElementsInDOM(element.parentElement, parentElements);
};
