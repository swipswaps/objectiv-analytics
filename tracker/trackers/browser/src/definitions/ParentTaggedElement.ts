import { TaggableElement } from './TaggableElement';
import { TaggingAttribute } from './TaggingAttribute';
import { TaggingAttributes } from './TaggingAttributes';

/**
 * A ParentTaggedElement is a TaggedElement with the TaggingAttribute.parentElementId
 */
export type ParentTaggedElement = TaggableElement & {
  dataset: Pick<TaggingAttributes, TaggingAttribute.parentElementId>;
};
