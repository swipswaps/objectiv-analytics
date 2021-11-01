import { ChildrenLocationTaggingAttributes } from './ChildrenTaggingAttribute';
import { TaggableElement } from './TaggableElement';

/**
 * A TagChildrenElement is a TaggableElement already decorated with our ChildrenLocationTaggingAttributes
 */
export type TagChildrenElement = TaggableElement & { dataset: ChildrenLocationTaggingAttributes };
