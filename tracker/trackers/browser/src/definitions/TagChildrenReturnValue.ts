import { Infer, optional } from 'superstruct';
import { StringifiedChildrenTaggingAttributes } from './StringifiedChildrenTaggingAttribute';

/**
 * The definition of the object returned by `tagChildren` and `tagChild`
 */
export const TagChildrenReturnValue = optional(StringifiedChildrenTaggingAttributes);

export type TagChildrenReturnValue = Infer<typeof TagChildrenReturnValue>;
