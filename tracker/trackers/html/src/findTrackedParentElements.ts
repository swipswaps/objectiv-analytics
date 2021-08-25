import { isTrackedElement } from './typeGuards';

/**
 * Walk the DOM upwards looking for Tracked Elements. The resulting array can be used to reconstruct a Location Stack.
 */
export const findTrackedParentElements = (
  element: HTMLElement | null,
  parentElements: HTMLElement[] = []
): HTMLElement[] => {
  if (!element) {
    return parentElements;
  }
  if (isTrackedElement(element)) {
    parentElements.push(element);
  }
  return findTrackedParentElements(element.parentElement, parentElements);
};
