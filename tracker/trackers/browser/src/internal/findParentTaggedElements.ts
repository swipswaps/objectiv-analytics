import { TaggableElement } from '../definitions/elements';
import { isParentTaggedElement, isTaggedElement } from '../definitions/guards';
import { TaggingAttribute } from '../definitions/TaggingAttribute';

/**
 * Walk the DOM upwards looking for Tagged Elements. The resulting array can be used to reconstruct a Location Stack.
 */
export const findParentTaggedElements = (
  element: TaggableElement | null,
  parentElements: TaggableElement[] = []
): TaggableElement[] => {
  if (!element) {
    return parentElements;
  }

  if (isTaggedElement(element)) {
    parentElements.push(element);
  }

  let nextElement: TaggableElement | null = element.parentElement;

  // If this element has a Parent Tagged Element Id specified, follow that instead of the DOM parentElement
  if (isParentTaggedElement(element)) {
    const parentElementId = element.getAttribute(TaggingAttribute.parentElementId);
    const parentElement = document.querySelector(`[${TaggingAttribute.elementId}='${parentElementId}']`);
    if (!isTaggedElement(parentElement)) {
      console.error(`findParentTaggedElements: missing or invalid Parent Element '${parentElementId}'`);
      return parentElements;
    }
    nextElement = parentElement;
  }

  return findParentTaggedElements(nextElement, parentElements);
};
