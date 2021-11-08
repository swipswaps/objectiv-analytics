import { TaggableElement } from './TaggableElement';

/**
 * A TrackedElement is either a TaggedElement or an EventTarget
 */
export type TrackedElement = TaggableElement | EventTarget;
