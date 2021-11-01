import { GuardableElement } from './GuardableElement';
import { isTaggedElement } from './isTaggedElement';
import { ParentTaggedElement } from './ParentTaggedElement';
import { TaggingAttribute } from './TaggingAttribute';

/**
 * A type guard to determine if the given Element is a TaggableElement decorated with TaggingAttributes.parentElementId.
 */
export const isParentTaggedElement = (element: GuardableElement): element is ParentTaggedElement =>
  isTaggedElement(element) && element.hasAttribute(TaggingAttribute.parentElementId);
