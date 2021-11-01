import { ChildrenTaggingAttributes } from './ChildrenTaggingAttribute';
import { TaggingAttribute } from './TaggingAttribute';
import { TaggingAttributes } from './TaggingAttributes';

/**
 * The type of Elements the type guards can work with
 */
export type GuardableElement = Node | EventTarget | null;

/**
 * A Trackable Element is an HTMLElement or an SVGElement
 */
export type TaggableElement = HTMLElement | SVGElement;

/**
 * A TaggedElement is a TaggableElement already decorated with our TaggingAttributes
 */
export type TaggedElement = TaggableElement & { dataset: TaggingAttributes };

/**
 * A TagChildrenElement is a TaggableElement already decorated with our ChildrenTaggingAttributes
 */
export type TagChildrenElement = TaggableElement & { dataset: ChildrenTaggingAttributes };

/**
 * A ParentTaggedElement is a TaggedElement with the TaggingAttribute.parentElementId
 */
export type ParentTaggedElement = TaggableElement & {
  dataset: Pick<TaggingAttributes, TaggingAttribute.parentElementId>;
};
