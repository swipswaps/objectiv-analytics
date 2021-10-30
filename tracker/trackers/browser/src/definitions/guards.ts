import { GuardableElement, ParentTaggedElement, TagChildrenElement, TaggableElement, TaggedElement } from './elements';
import { TaggingAttribute } from './TaggingAttribute';

/**
 * A type guard to determine if a the given Element is an HTMLElement or SVGElement.
 * In general we can only tag Elements supporting dataset attributes.
 */
export const isTaggableElement = (element: GuardableElement): element is TaggableElement =>
  element instanceof HTMLElement || element instanceof SVGElement;

/**
 * A type guard to determine if the given Element is a TaggableElement decorated with TaggingAttributes.
 * Note: For performance and simplicity we only check if `context` is present. Assume all other attributes are there.
 */
export const isTaggedElement = (element: GuardableElement): element is TaggedElement =>
  isTaggableElement(element) && element.hasAttribute(TaggingAttribute.context);

/**
 * A type guard to determine if the given Element is a TaggableElement decorated with ChildrenTaggingAttributes.
 */
export const isTagChildrenElement = (element: GuardableElement): element is TagChildrenElement =>
  isTaggableElement(element) && element.hasAttribute(TaggingAttribute.tagChildren);

/**
 * A type guard to determine if the given Element is a TaggableElement decorated with TaggingAttributes.parentElementId.
 */
export const isParentTaggedElement = (element: GuardableElement): element is ParentTaggedElement =>
  isTaggedElement(element) && element.hasAttribute(TaggingAttribute.parentElementId);
