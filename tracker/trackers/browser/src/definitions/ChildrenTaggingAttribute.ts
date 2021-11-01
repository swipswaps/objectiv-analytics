import { array, Infer, object } from 'superstruct';
import { ChildrenTaggingQuery } from './ChildrenTaggingQuery';
import { TaggingAttribute } from './TaggingAttribute';

/**
 * The set of TaggingAttribute returned by `tagChildren` and `tagChild`
 */
export const ChildrenTaggingAttributes = object({
  [TaggingAttribute.tagChildren]: array(ChildrenTaggingQuery),
});
export type ChildrenTaggingAttributes = Infer<typeof ChildrenTaggingAttributes>;
