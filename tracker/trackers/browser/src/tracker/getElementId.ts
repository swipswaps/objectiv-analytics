import { TaggingAttribute } from '../TaggingAttribute';
import { isTaggedElement, TaggableElement } from '../typeGuards';

/**
 * Attempts to retrieves the elementId Tagging Attribute from a given Element. Returns `undefined` if not possible.
 */
export const getElementId = (element: TaggableElement | EventTarget): undefined | string => {
  if (!isTaggedElement(element)) {
    return undefined;
  }

  return element.getAttribute(TaggingAttribute.elementId) ?? undefined;
};
