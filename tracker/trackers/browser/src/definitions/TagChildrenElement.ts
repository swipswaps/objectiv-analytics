import { ChildrenTaggingAttributes } from './ChildrenTaggingAttribute';
import { TaggableElement } from './TaggableElement';

/**
 * A TagChildrenElement is a TaggableElement already decorated with our ChildrenTaggingAttributes
 */
export type TagChildrenElement = TaggableElement & { dataset: ChildrenTaggingAttributes };
