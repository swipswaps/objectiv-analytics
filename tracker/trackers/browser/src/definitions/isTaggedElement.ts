import { GuardableElement } from './GuardableElement';
import { isTaggableElement } from './isTaggableElement';
import { TaggedElement } from './TaggedElement';
import { TaggingAttribute } from './TaggingAttribute';

/**
 * A type guard to determine if the given Element is a TaggableElement decorated with TaggingAttributes.
 * Note: For performance and simplicity we only check if `context` is present. Assume all other attributes are there.
 */
export const isTaggedElement = (element: GuardableElement): element is TaggedElement =>
  isTaggableElement(element) && element.hasAttribute(TaggingAttribute.context);
