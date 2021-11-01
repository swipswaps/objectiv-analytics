import { TaggingAttributes } from './TaggingAttributes';
import { TaggableElement } from './TaggableElement';

/**
 * A TaggedElement is a TaggableElement already decorated with our TaggingAttributes
 */
export type TaggedElement = TaggableElement & { dataset: TaggingAttributes };
