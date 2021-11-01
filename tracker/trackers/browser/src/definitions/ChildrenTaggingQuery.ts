import { Infer, object, optional, string } from 'superstruct';
import { StringifiedTaggingAttributes } from './TaggingAttributes';

/**
 * The parameters of `tagChild`
 */
export const ChildrenTaggingQuery = object({
  queryAll: string(),
  tagAs: optional(StringifiedTaggingAttributes),
});
export type ChildrenTaggingQuery = Infer<typeof ChildrenTaggingQuery>;
