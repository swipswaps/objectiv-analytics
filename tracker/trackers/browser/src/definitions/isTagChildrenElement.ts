import { GuardableElement } from './GuardableElement';
import { isTaggableElement } from './isTaggableElement';
import { TagChildrenElement } from './TagChildrenElement';
import { TaggingAttribute } from './TaggingAttribute';

/**
 * A type guard to determine if the given Element is a TaggableElement decorated with ChildrenTaggingAttributes.
 */
export const isTagChildrenElement = (element: GuardableElement): element is TagChildrenElement =>
  isTaggableElement(element) && element.hasAttribute(TaggingAttribute.tagChildren);
