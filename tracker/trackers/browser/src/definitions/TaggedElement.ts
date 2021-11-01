import { LocationTaggingAttributes } from './LocationTaggingAttributes';
import { TaggableElement } from './TaggableElement';

/**
 * A TaggedElement is a TaggableElement already decorated with our LocationTaggingAttributes
 */
export type TaggedElement = TaggableElement & { dataset: LocationTaggingAttributes };
