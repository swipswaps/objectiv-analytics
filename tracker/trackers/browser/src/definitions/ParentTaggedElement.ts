import { TaggableElement } from './TaggableElement';
import { TaggingAttribute } from './TaggingAttribute';
import { LocationTaggingAttributes } from './LocationTaggingAttributes';

/**
 * A ParentTaggedElement is a TaggedElement with the TaggingAttribute.parentElementId
 */
export type ParentTaggedElement = TaggableElement & {
  dataset: Pick<LocationTaggingAttributes, TaggingAttribute.parentElementId>;
};
