import { ElementTrackingAttribute } from '../TrackingAttributes';
import { isCustomParentTrackedElement, isTrackedElement, TrackableElement } from '../typeGuards';

/**
 * Walk the DOM upwards looking for Tracked Elements. The resulting array can be used to reconstruct a Location Stack.
 */
const findTrackedParentElements = (
  element: TrackableElement | null,
  parentElements: TrackableElement[] = []
): TrackableElement[] => {
  if (!element) {
    return parentElements;
  }

  if (isTrackedElement(element)) {
    parentElements.push(element);
  }

  let nextElement: TrackableElement | null = element.parentElement;

  // If this element has a Parent Tracked Element Id specified, follow that instead of the DOM parentElement
  if (isCustomParentTrackedElement(element)) {
    const parentElementId = element.getAttribute(ElementTrackingAttribute.parentElementId);
    const parentElement = document.querySelector(`[${ElementTrackingAttribute.elementId}='${parentElementId}']`);
    if (isTrackedElement(parentElement)) {
      nextElement = parentElement;
    }
  }

  return findTrackedParentElements(nextElement, parentElements);
};

export default findTrackedParentElements;
